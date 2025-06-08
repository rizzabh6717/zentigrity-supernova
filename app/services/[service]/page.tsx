"use client";
import React from "react";

const MEN_SALON_PACKAGES = [
  {
    name: "Grooming essentials",
    rating: 4.88,
    reviews: 892000,
    price: 557,
    originalPrice: 657,
    duration: "1 hr 5 mins",
    features: [
      { label: "Haircut", desc: "Haircut for men" },
      { label: "Shave/beard grooming", desc: "Beard trimming & styling" },
      { label: "Massage", desc: "Head massage (10 mins)" },
    ],
  },
  {
    name: "Haircut & color",
    rating: 4.88,
    reviews: 536000,
    price: 508,
    originalPrice: 558,
    duration: "60 mins",
    features: [
      { label: "Haircut & color", desc: "Haircut for men" },
      { label: "Hair color (Garnier)", desc: "Brown black (shade 3)" },
    ],
  },
];

const UC_PROMISE = [
  "Verified Professionals",
  "Hassle Free Booking",
  "Transparent Pricing",
];

function CashbackOffer() {
  return (
    <div className="bg-black rounded-lg shadow p-4 flex items-center gap-3 mb-6 border border-green-200">
      <div className="bg-green-100 rounded-full p-2">
        <span className="text-green-600 text-lg font-bold">%</span>
      </div>
      <div>
        <div className="font-semibold text-green-800">Amazon cashback upto ₹50</div>
        <div className="text-gray-700">Via Amazon Pay balance</div>
        <a href="#" className="text-blue-600 underline">View More Offers</a>
      </div>
    </div>
  );
}

function UCPromise() {
  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4">
      <div className="font-bold text-lg mb-2">UC Promise</div>
      <ul className="text-sm text-gray-700 list-disc pl-5">
        {UC_PROMISE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

import { bookPackageOnChain } from "./bookOnChain";
import { useState } from "react";

function PackageCard({ pkg, index, serviceName }: { pkg: typeof MEN_SALON_PACKAGES[0], index: number, serviceName: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-700 font-bold text-xs">PACKAGE</span>
        <button className="bg-purple-100 text-gray-700 px-4 py-1 rounded font-semibold text-sm">Add</button>
      </div>
      <div className="font-bold text-lg mb-1 text-black">{pkg.name}</div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-700 text-xs font-bold">★ {pkg.rating} ({(pkg.reviews/1000).toFixed(0)}K reviews)</span>
        <span className="text-gray-700 text-xs">• {pkg.duration}</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold text-lg">₹{pkg.price}</span>
        <span className="line-through text-gray-700 text-sm">₹{pkg.originalPrice}</span>
      </div>
      <ul className="text-sm text-gray-700 mb-2">
        {pkg.features.map((f) => (
          <li key={f.label}>
            <span className="font-bold">{f.label}:</span> {f.desc}
          </li>
        ))}
      </ul>
      <button
  className="border rounded px-3 py-1 text-sm font-semibold hover:bg-gray-100 disabled:opacity-50"
  disabled={loading}
  onClick={async () => {
    setLoading(true);
    try {
      const txHash = await bookPackageOnChain(serviceName, index);
      alert("Booking successful! Transaction hash: " + txHash);
    } catch (e: any) {
      alert("Booking failed: " + (e?.message || e));
    } finally {
      setLoading(false);
    }
  }}
>
  {loading ? "Booking..." : "Book package"}
</button>
    </div>
  );
}

export default function ServiceDetailPage({ params }: { params: { service: string } }) {
  const service = decodeURIComponent(params.service || "");
  // Payment Gateway UI must be checked first
  if (service.toLowerCase().includes("payment gateway")) {
    const [receiver, setReceiver] = React.useState("");
    const [amount, setAmount] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [txHash, setTxHash] = React.useState("");
    const [error, setError] = React.useState("");
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="bg-white/90 rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-6 border border-blue-100">
          <h1 className="text-3xl font-bold text-blue-700 mb-2 text-center">Payment Gateway</h1>
          <div className="flex flex-col gap-4">
            <label className="block">
              <span className="text-gray-700 font-semibold">Receiver's Wallet Address</span>
              <input
                type="text"
                placeholder="0x..."
                value={receiver}
                onChange={e => setReceiver(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-blue-200 px-4 py-2 bg-blue-50 text-gray-900 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-semibold">Amount</span>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="Enter amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-blue-200 px-4 py-2 bg-blue-50 text-gray-900 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              />
            </label>
            <button
              className="w-full mt-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow transition disabled:opacity-60"
              disabled={loading}
              onClick={async () => {
                setError("");
                setTxHash("");
                setLoading(true);
                try {
                  if (!window.ethereum) throw new Error("MetaMask not detected");
                  // Fuji testnet chainId is 0xA869 (43113)
                  const FUJI_CHAIN_ID = "0xA869";
                  const FUJI_PARAMS = {
                    chainId: FUJI_CHAIN_ID,
                    chainName: "Avalanche Fuji C-Chain",
                    nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
                    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
                    blockExplorerUrls: ["https://testnet.snowtrace.io/"]
                  };
                  // Check network and prompt switch if needed
                  const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
                  if (currentChainId !== FUJI_CHAIN_ID) {
                    try {
                      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: FUJI_CHAIN_ID }] });
                    } catch (switchError: any) {
                      // This error code indicates the chain has not been added to MetaMask
                      if (switchError.code === 4902) {
                        try {
                          await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [FUJI_PARAMS] });
                        } catch (addError) {
                          throw new Error("Please add the Fuji testnet to MetaMask");
                        }
                      } else {
                        throw new Error("Please switch to the Fuji testnet in MetaMask");
                      }
                    }
                  }
                  const { ethers } = await import('ethers');
                  const provider = new ethers.providers.Web3Provider(window.ethereum);
                  const signer = provider.getSigner();
                  const tx = await (await signer).sendTransaction({
                    to: receiver,
                    value: ethers.utils.parseEther(amount || "0")
                  });
                  await tx.wait();
                  setTxHash(tx.hash);
                } catch (err) {
                  if (err instanceof Error) {
                    setError(err.message);
                  } else {
                    setError("Transaction failed");
                  }
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "Processing..." : "Send Payment"}
            </button>
            {txHash && (
              <div className="text-green-600 text-sm mt-2 break-all">Payment sent! Tx Hash: <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">{txHash}</a></div>
            )}
            {error && (
              <div className="text-red-600 text-sm mt-2">{error}</div>
            )}
          </div>
        </div>
      </div>
    );
  }
  if (service.toLowerCase().includes("men")) {
    return (
      <div className="flex flex-col md:flex-row gap-8 p-8 min-h-screen bg-[#f7f7f9]">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6 text-black">Packages</h1>
          {MEN_SALON_PACKAGES.map((pkg, idx) => (
            <PackageCard key={pkg.name} pkg={pkg} index={idx} serviceName={service} />
          ))}
        </div>
        <div className="w-full md:w-80">
          <div className="mb-6">
            <img src="/services/men's salon.png" alt="Men's Salon" className="rounded-xl w-full mb-4" />
            <div className="text-center font-bold text-lg mb-2">No items in your cart</div>
            <div className="text-center text-gray-700 text-sm mb-4">Your cart is empty</div>
          </div>
          <CashbackOffer />
          <UCPromise />
        </div>
      </div>
    );
  }
  // Payment Gateway UI
  if (service.toLowerCase().includes("payment gateway")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="bg-white/90 rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-6 border border-blue-100">
          <h1 className="text-3xl font-bold text-blue-700 mb-2 text-center">Payment Gateway</h1>
          <div className="flex flex-col gap-4">
            <label className="block">
              <span className="text-gray-700 font-semibold">Receiver's Wallet Address</span>
              <input
                type="text"
                placeholder="0x..."
                className="mt-1 block w-full rounded-lg border border-blue-200 px-4 py-2 bg-blue-50 text-gray-900 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-semibold">Amount</span>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="Enter amount"
                className="mt-1 block w-full rounded-lg border border-blue-200 px-4 py-2 bg-blue-50 text-gray-900 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              />
            </label>
            <button className="w-full mt-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow transition">Send Payment</button>
          </div>
        </div>
      </div>
    );
  }
  // Placeholder for other services
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f7f7f9]">
      <h1 className="text-3xl font-bold mb-6">{service}</h1>
      <div className="text-gray-700">Service details coming soon!</div>
    </div>
  );
}
