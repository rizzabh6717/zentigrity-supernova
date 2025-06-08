"use client";
import React, { useEffect, useState } from "react";

function shortenAddress(addr: string) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
}

const NavbarWithWallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage for wallet address on mount (client only)
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("walletAddress");
      if (stored) setWalletAddress(stored);
    }
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-[#18181b] backdrop-blur shadow-sm border-b border-gray-800 animate-fade-in-down">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl text-primary">ZENTIGRITY</span>
        </div>
        <div className="hidden md:flex gap-4 items-center">
          <a href="/" className="px-3 py-1 rounded-md text-sm font-medium text-white bg-[#232329] hover:bg-[#35353b] transition-colors">Home</a>
          <a href="/services" className="px-3 py-1 rounded-md text-sm font-medium text-white bg-[#232329] hover:bg-[#35353b] transition-colors">Services</a>
          <a href="/dashboard" className="px-3 py-1 rounded-md text-sm font-medium text-white bg-[#232329] hover:bg-[#35353b] transition-colors">Dashboard</a>
          <a href="/profile" className="px-3 py-1 rounded-md text-sm font-medium text-white bg-[#232329] hover:bg-[#35353b] transition-colors">Profile</a>
        </div>
        <div className="flex items-center gap-2">
          {walletAddress ? (
            <div className="flex items-center gap-2 bg-[#232329] px-3 py-1 rounded-full">
              <span className="text-green-400 font-semibold text-xs">Connected</span>
              <span className="text-white font-mono text-xs">{shortenAddress(walletAddress)}</span>
              <button
                className="ml-2 px-2 py-1 rounded bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition"
                onClick={() => {
                  localStorage.removeItem("walletAddress");
                  setWalletAddress(null);
                }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <a href="/login" className="rounded-full px-4 py-2 text-[#18181b] font-semibold shadow transition-colors bg-white hover:bg-gray-200">Login</a>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarWithWallet;
