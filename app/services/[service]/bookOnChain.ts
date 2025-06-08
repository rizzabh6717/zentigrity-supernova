import { ethers } from "ethers";

// You may want to move these to your .env or config
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BOOKING_CONTRACT_ADDRESS || "";
const CONTRACT_ABI = [
  // Replace with your actual contract ABI
  {
    "inputs": [
      { "internalType": "string", "name": "serviceName", "type": "string" },
      { "internalType": "uint256", "name": "packageIndex", "type": "uint256" }
    ],
    "name": "bookPackage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export async function bookPackageOnChain(serviceName: string, packageIndex: number) {
  if (!window.ethereum) throw new Error("Wallet not found");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const tx = await contract.bookPackage(serviceName, packageIndex);
  await tx.wait();
  return tx.hash;
}
