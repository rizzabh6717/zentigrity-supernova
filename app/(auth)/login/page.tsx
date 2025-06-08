/*
'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';

// Dynamically import the Self components with SSR disabled
const SelfQRcodeWrapper = dynamic(
  () => import('@selfxyz/qrcode').then(mod => mod.default),
  { ssr: false }
);

function Playground() {
  const [userId, setUserId] = useState<string | null>(null);
  const [selfApp, setSelfApp] = useState<any>(null);

  useEffect(() => {
    // Generate UUID and create SelfApp instance only on client side
    const newUserId = uuidv4();
    setUserId(newUserId);
    
    // Import and initialize SelfAppBuilder only on client side
    import('@selfxyz/qrcode').then(({ SelfAppBuilder }) => {
      const app = new SelfAppBuilder({
        appName: "Urbexium",
        scope: "self-playground",
        endpoint: "https://playground.staging.self.xyz/api/verify",
        userId: newUserId,
        devMode: !1
      }).build();
      
      setSelfApp(app);
      
      console.log("selfApp configuration:", {
        appName: app.appName,
        scope: app.scope,
        endpoint: app.endpoint,
        userId: app.userId
      });
    });
  }, []);
  
  if (!userId || !selfApp) return (
    <div className="App flex flex-col min-h-screen bg-black text-white">
      <nav className="w-full bg-black border-b border-gray-800 py-3 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">ZENTIGRITY</h1>
      </nav>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <p>Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="App flex flex-col min-h-screen bg-black text-white" suppressHydrationWarning>
      <nav className="w-full bg-black border-b border-gray-800 py-3 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">ZENTIGRITY</h1>
      </nav>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <h2 className="text-xl md:text-2xl font-bold mb-8">Login with Self Protocol by CELO</h2>
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={() => {
                console.log('Verification successful');
                
                // Store user ID in local storage
                localStorage.setItem('userId', userId);
                // Redirect to dashboard
                setTimeout(() => {
                  window.location.href = '/dashboard';
                }, 3000);
              }}
              darkMode={true}
            />
            <p className="mt-4 text-sm text-gray-400">
              User ID: {userId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Playground;
*/

// Metamask Login Feature (replacing Self Protocol login)
'use client';

import React, { useState } from 'react';

const MetamaskLogin = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Connect to Metamask
  const connectWallet = async () => {
    setError(null);
    setLoading(true);
    try {
      if (typeof window.ethereum === 'undefined') {
        setError('MetaMask is not installed. Please install MetaMask and try again.');
        setLoading(false);
        return;
      }
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
      localStorage.setItem('walletAddress', accounts[0]);
      // Optionally, redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#18181b]">
      <div className="bg-[#232329] rounded-xl shadow-xl p-8 w-full max-w-md border border-[#28282d]">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Login with MetaMask</h2>
        <div className="flex flex-col items-center gap-6">
          {!walletAddress ? (
            <button
              onClick={connectWallet}
              className="px-6 py-3 rounded-lg font-semibold bg-[#6C47FF] text-white hover:bg-[#5a38cc] transition"
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect MetaMask Wallet'}
            </button>
          ) : (
            <>
              <div className="text-green-400 font-semibold">Connected!</div>
              <div className="text-sm text-gray-300 break-all">{walletAddress}</div>
            </>
          )}
          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default MetamaskLogin;