import os
import uuid
import time
from flask import Flask, request, render_template, jsonify, send_from_directory
import base64
import requests
import json
from web3 import Web3

from coinbase_agentkit import (
    AgentKit,
    AgentKitConfig,
    EthAccountWalletProvider,
    EthAccountWalletProviderConfig,
    erc20_action_provider,
    pyth_action_provider,
    wallet_action_provider,
    weth_action_provider,
)
from dotenv import load_dotenv
from eth_account import Account
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from flask_cors import CORS

# Load environment variables
load_dotenv()

# Load ABI from JSON file
ABI_PATH = os.path.join(os.path.dirname(__file__), 'abi', 'GrievanceRegistry.json')
with open(ABI_PATH, 'r') as f:
    _abi_json = json.load(f)
    GRIEVANCE_CONTRACT_ABI = _abi_json

app = Flask(__name__)
CORS(app)

# Initialize global agent and wallet provider
agent = None
wallet_provider = None

# Configure a file to persist the agent's CDP API Wallet Data.
wallet_data_file = "wallet_data.txt"

# Ensure necessary environment variables are set
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY')
assert HUGGINGFACE_API_KEY, "You must set the HUGGINGFACE_API_KEY environment variable"

PRIVATE_KEY = os.getenv("PRIVATE_KEY")
assert PRIVATE_KEY, "You must set the PRIVATE_KEY environment variable"
assert PRIVATE_KEY.startswith("0x"), "Private key must start with 0x hex prefix"

GRIEVANCE_CONTRACT_ADDRESS = os.getenv("GRIEVANCE_CONTRACT_ADDRESS")
assert GRIEVANCE_CONTRACT_ADDRESS, "You must set the GRIEVANCE_CONTRACT_ADDRESS environment variable"

# Set up AVAX RPC URL
AVAX_RPC_URL = os.getenv("AVAX_RPC_URL")
assert AVAX_RPC_URL, "You must set the AVAX_RPC_URL environment variable"
web3 = Web3(Web3.HTTPProvider(AVAX_RPC_URL))

# In-memory storage for grievances
GRIEVANCE_STORE = []

# Custom helper functions
def clip_grievance_categorize(image_base64):
    API_URL = "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32"
    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    
    image_data = base64.b64decode(image_base64)
    categories = [
        "road pothole", "broken street light", "graffiti vandalism", 
        "fallen tree", "water leak", "garbage dumping", "broken sidewalk", 
        "missing street sign", "flooding", "damaged public property"
    ]
    
    data = {
        "image": base64.b64encode(image_data).decode('utf-8'),
        "parameters": {
            "candidate_labels": categories
        }
    }
    try:
        response = requests.post(API_URL, headers=headers, json=data)
        print('CLIP API response:', response.status_code, response.text)
        if response.status_code == 503:
            # Service unavailable, return fallback
            return {
                "category": "unclassified",
                "priorityLevel": "medium",
                "estimatedDays": 7,
                "confidence": 0,
                "error": "AI-based media analysis is temporarily unavailable. Your report has been received, but the AI justification will be added once the service is back online.",
                "all_results": []
            }
        if response.status_code != 200:
            return {
                "category": "unclassified",
                "priorityLevel": "medium",
                "estimatedDays": 7,
                "confidence": 0,
                "error": f"CLIP API error: {response.status_code} - {response.text}",
                "all_results": []
            }
        clip_results = response.json()
        
        if isinstance(clip_results, list) and len(clip_results) > 0:
            highest_score = 0
            category = "unclassified"
            
            for item in clip_results:
                if item["score"] > highest_score:
                    highest_score = item["score"]
                    category = item["label"]
            
            high_priority = ["water leak", "flooding", "fallen tree", "broken street light"]
            medium_priority = ["road pothole", "damaged public property", "missing street sign"]
            low_priority = ["graffiti vandalism", "garbage dumping", "broken sidewalk"]
            
            if category in high_priority:
                priority, days = "high", 3
            elif category in medium_priority:
                priority, days = "medium", 7
            else:
                priority, days = "low", 14
                
            return {
                "category": category,
                "priorityLevel": priority,
                "estimatedDays": days,
                "confidence": highest_score,
                "all_results": clip_results
            }
        else:
            return {
                "category": "unclassified",
                "priorityLevel": "medium",
                "estimatedDays": 7,
                "confidence": 0,
                "error": "CLIP analysis failed",
                "all_results": []
            }
    except Exception as e:
        print('CLIP API Exception:', str(e))
        return {
            "category": "unclassified",
            "priorityLevel": "medium",
            "estimatedDays": 7,
            "confidence": 0,
            "error": "AI-based media analysis is temporarily unavailable. Your report has been received, but the AI justification will be added once the service is back online.",
            "all_results": []
        }

def wait_for_tx_receipt(web3, tx_hash, timeout=120, poll_interval=5):
    start = time.time()
    while True:
        try:
            receipt = web3.eth.get_transaction_receipt(tx_hash)
            if receipt:
                return receipt
        except Exception:
            pass
        if time.time() - start > timeout:
            print(f"[ERROR] Transaction {tx_hash.hex()} not mined within {timeout} seconds.")
            return None
        time.sleep(poll_interval)

def get_pending_tx_gas_price(web3, address, nonce):
    try:
        tx = web3.eth.get_transaction_by_nonce(address, nonce)
        if tx and hasattr(tx, 'gasPrice'):
            return int(tx.gasPrice)
        elif tx and 'gasPrice' in tx:
            return int(tx['gasPrice'])
        return None
    except Exception as e:
        print(f"[DEBUG] Could not fetch pending tx gas price: {e}")
        return None

def submit_grievance_to_blockchain(grievance_data):
    try:
        import json
        import traceback
        if "trackingId" not in grievance_data or not grievance_data["trackingId"]:
            grievance_data["trackingId"] = f"GRV-{uuid.uuid4().hex[:8].upper()}"

        account = Account.from_key(PRIVATE_KEY)
        tracking_id = grievance_data["trackingId"]

        contract = web3.eth.contract(
            address=GRIEVANCE_CONTRACT_ADDRESS,
            abi=GRIEVANCE_CONTRACT_ABI
        )

        # Prepare the arguments for the contract function (11 separate args, not a tuple)
        tx = contract.functions.submitGrievance(
            grievance_data["title"],
            grievance_data["description"],
            grievance_data["category"],
            grievance_data["location"],
            int(grievance_data.get("mediaCount", 0)),
            grievance_data["priorityLevel"],
            grievance_data["trackingId"],
            int(grievance_data.get("estimatedDays", 7)),
            int(grievance_data.get("fundAmount", 0)),
            grievance_data.get("currency", "INR"),
            grievance_data["aiJustification"]
        ).build_transaction({
            'from': account.address,
            'nonce': web3.eth.get_transaction_count(account.address, 'pending'),
            'gasPrice': int(web3.eth.gas_price * (1.2 + 0 * 0.1))
        })
        
        # Estimate gas and add a 20% buffer
        estimated_gas = web3.eth.estimate_gas(tx)
        tx['gas'] = int(estimated_gas * 1.2)
        
        signed_tx = account.sign_transaction(tx)
        raw_tx = getattr(signed_tx, 'raw_transaction', None)
        if raw_tx is None:
            raise AttributeError("Could not extract raw transaction bytes from signed transaction object")
        tx_hash = web3.eth.send_raw_transaction(raw_tx)
        receipt = wait_for_tx_receipt(web3, tx_hash)
        if not receipt:
            return {"success": False, "error": "submitGrievance tx not mined"}
        return {
            "success": True,
            "tracking_id": tracking_id,
            "tx_hash": tx_hash.hex()
        }
    except Exception as e:
        import traceback
        error_msg = str(e)
        print(f"[FATAL] Exception in grievance submission: {error_msg}")
        print(f"[DEBUG] Exception Traceback:\n{traceback.format_exc()}")
        return {"success": False, "error": error_msg}

# Flask routes
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/submit_grievance", methods=["POST"])
def submit_grievance():
    try:
        title = request.form.get("title", "Untitled Grievance")
        description = request.form.get("description", "No description provided")
        location = request.form.get("location", "Unknown")
        image_file = request.files.get("image")
        
        if not image_file:
            return jsonify({"success": False, "error": "No image provided"}), 400
        
        image_data = image_file.read()
        image_base64 = base64.b64encode(image_data).decode("utf-8")
        
        clip_results = clip_grievance_categorize(image_base64)
        print(clip_results)
        tracking_id = f"GRV-{uuid.uuid4().hex[:8].upper()}"
        grievance_data = {
            "trackingId": tracking_id,
            "title": title,
            "description": description,
            "location": location,
            "category": clip_results.get("category", "Unclassified"),
            "priorityLevel": clip_results.get("priorityLevel", "medium"),
            "estimatedDays": int(clip_results.get("estimatedDays", 7)),
            "mediaCount": 1,
            "aiJustification": json.dumps(clip_results.get("all_results", [])),
            "status": "submitted",
            "createdAt": int(time.time()),
            "updatedAt": int(time.time()),
            "submitter": "backend-local",
            "resolved": False,
            "blockchainStatus": "pending",
            "tx_hash": None,
            "blockchainError": None
        }
        # Store the grievance regardless of blockchain result
        GRIEVANCE_STORE.append(grievance_data)
        # Attempt to submit to blockchain
        blockchain_result = submit_grievance_to_blockchain(grievance_data)
        print('[DEBUG] Blockchain result:', blockchain_result)
        # Update the stored grievance with blockchain result
        for g in GRIEVANCE_STORE:
            if g["trackingId"] == tracking_id:
                if blockchain_result.get("success"):
                    g["blockchainStatus"] = "success"
                    g["tx_hash"] = blockchain_result.get("tx_hash")
                else:
                    g["blockchainStatus"] = "failed"
                    g["blockchainError"] = blockchain_result.get("error")
                break
        return jsonify({
            "success": True,
            "trackingId": tracking_id,
            "grievance": grievance_data,
            "blockchain": blockchain_result
        })
    except Exception as e:
        print(e)
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/get_grievance/<tracking_id>", methods=["GET"])
def get_grievance(tracking_id):
    try:
        result = next((g for g in GRIEVANCE_STORE if g["trackingId"] == tracking_id), None)
        if result:
            return jsonify({"success": True, "data": result})
        else:
            return jsonify({"success": False, "error": "Grievance not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/get_all_grievances", methods=["GET"])
def get_all_grievances():
    try:
        return jsonify({"success": True, "data": GRIEVANCE_STORE})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/mark_resolved/<tracking_id>", methods=["POST"])
def mark_resolved(tracking_id):
    try:
        account = Account.from_key(PRIVATE_KEY)
        contract_args = [tracking_id]
        transaction = {
            "to": GRIEVANCE_CONTRACT_ADDRESS,
            "data": web3.eth.contract(address=GRIEVANCE_CONTRACT_ADDRESS, abi=GRIEVANCE_CONTRACT_ABI).functions.markResolved(*contract_args).build_transaction({
                'from': account.address,
                'nonce': web3.eth.get_transaction_count(account.address, 'pending'),
                'gas': 200000,
                'gasPrice': web3.eth.gas_price,
            }),
            "value": 0,
        }

        signed_tx = account.sign_transaction(transaction)
        raw_tx = getattr(signed_tx, 'raw_transaction', None)
        if raw_tx is None:
            raise AttributeError("Could not extract raw transaction bytes from signed transaction object")
        tx_hash = web3.eth.send_raw_transaction(raw_tx)
        
        return jsonify({
            "success": True,
            "transaction_hash": tx_hash.hex(),
            "explorer_link": f"https://base-sepolia.blockscout.com/tx/{tx_hash.hex()}"
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

def initialize_agent():
    global agent, wallet_provider
    account = Account.from_key(PRIVATE_KEY)
# Initialize with proper chain ID (Base Sepolia)
    wallet_provider = EthAccountWalletProvider(
        config=EthAccountWalletProviderConfig(
            account=account,
            chain_id="84532",  # Base Sepolia chain ID
            rpc_url="https://sepolia.base.org"  # Explicit RPC endpoint
        )
    )
        
def encode_contract_call(self, abi, function_name, args):
    """Proper contract function encoding for web3.py v6+"""
    # Create contract instance with full ABI and address
    contract = self.web3.eth.contract(
        address=GRIEVANCE_CONTRACT_ADDRESS,
        abi=abi
    )
    
    try:
        # Get the function object with bound arguments
        func = contract.get_function_by_name(function_name)(*args)
        
        # Encode the transaction data
        return func._encode_transaction_data()
        
    except ValueError as e:
        raise Exception(f"Function encoding failed: {str(e)}") from e

# Monkey patch the wallet provider class
EthAccountWalletProvider.encode_contract_call = encode_contract_call
# Monkey patch the wallet provider class
if __name__ == "__main__":
    initialize_agent()
    app.run(host="0.0.0.0", port=5000, debug=True)