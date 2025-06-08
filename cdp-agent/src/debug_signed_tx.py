from dotenv import load_dotenv
load_dotenv(dotenv_path="../.env")
from web3 import Web3
from eth_account import Account
import os

PRIVATE_KEY = os.getenv("PRIVATE_KEY")
AVAX_RPC_URL = os.getenv("AVAX_RPC_URL")

web3 = Web3(Web3.HTTPProvider(AVAX_RPC_URL))
account = Account.from_key(PRIVATE_KEY)

tx = {
    'to': account.address,
    'value': 0,
    'nonce': web3.eth.get_transaction_count(account.address, 'pending'),
    'gas': 21000,
    'gasPrice': web3.eth.gas_price,
}

signed_tx = account.sign_transaction(tx)
print("type:", type(signed_tx))
for attr in dir(signed_tx):
    if not attr.startswith("__"):
        try:
            print(f"{attr}: {getattr(signed_tx, attr)}")
        except Exception as e:
            print(f"{attr}: <error: {e}>")
