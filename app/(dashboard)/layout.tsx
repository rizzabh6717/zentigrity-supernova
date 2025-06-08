"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Wallet state logic (copied from NavbarWithWallet)
function shortenAddress(addr: string) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
}

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertCircle,
  BarChart3,
  ChevronDown,
  Home,
  LogOut,
  Settings,
  User,
  Wallet,
  Briefcase,
  Award,
  Vote,
  Building,
  DollarSign,
  ShieldAlert,
  Scale,
} from "lucide-react"

function useWalletState() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("walletAddress");
      if (stored) setWalletAddress(stored);
    }
  }, []);
  const disconnect = () => {
    localStorage.removeItem("walletAddress");
    setWalletAddress(null);
  };
  return { walletAddress, setWalletAddress, disconnect };
}

function WalletSidebarInfo() {
  const { walletAddress, disconnect } = useWalletState();
  if (!walletAddress) return null;
  return (
    <>
      <hr className="border-t border-gray-700 my-2 w-full" />
      <div className="flex items-center gap-2 bg-[#232329] px-3 py-1 rounded-full">
        <span className="text-green-400 font-semibold text-xs">Connected</span>
        <span className="text-white font-mono text-xs tracking-wider px-2 py-0.5 bg-black/20 rounded">
          {shortenAddress(walletAddress)}
        </span>
        <button
          className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-400"
          onClick={disconnect}
        >
          Disconnect
        </button>
      </div>
    </>
  );
}

function WalletHeaderInfo() {
  const { walletAddress } = useWalletState();
  if (!walletAddress) return null;
  return (
    <div className="flex items-center gap-3 bg-[#232329] px-4 py-1 rounded-full">
      <span className="text-green-400 font-semibold text-xs">Connected</span>
      <span className="text-white font-mono text-xs tracking-wider px-2 py-1 bg-black/20 rounded-md">
        {shortenAddress(walletAddress)}
      </span>
    </div>
  );
}

function WalletDropdownDisconnect() {
  const { walletAddress, disconnect } = useWalletState();
  if (!walletAddress) return null;
  return (
    <DropdownMenuItem onClick={disconnect} className="text-red-500">
      <LogOut className="mr-2 h-4 w-4" />
      <span>Disconnect Wallet</span>
    </DropdownMenuItem>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<"citizen" | "worker" | "dao" | "admin">("citizen")

  const handleRoleChange = (role: "citizen" | "worker" | "dao" | "admin") => {
    setUserRole(role)
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Fixed Sidebar */}
        <div className="fixed inset-y-0 left-0 z-40 w-64">
          <Sidebar className="h-full flex flex-col bg-gradient-to-b from-[#18181b] via-[#232329] to-[#18181b] shadow-lg">
            <SidebarHeader className="border-b px-6 py-3">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="font-bold text-3xl text-primary">ZENTIGRITY</span>
              </Link>
            </SidebarHeader>
            <SidebarContent className="flex-grow overflow-y-auto">
              {/* Citizen Navigation */}
              {userRole === "citizen" && (
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                      <Link href="/dashboard" className={`group flex items-center gap-2 px-3 py-2 rounded transition-colors ${pathname === "/dashboard" ? "bg-[#28282d] border-l-4 border-green-400" : "hover:bg-[#222226]"}`}>
                        <Home className={`h-4 w-4 ${pathname === "/dashboard" ? "text-green-400" : "text-gray-400 group-hover:text-green-300"}`} />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/submit-grievance"}>
                      <Link href="/submit-grievance" className={`group flex items-center gap-2 px-3 py-2 rounded transition-colors ${pathname === "/submit-grievance" ? "bg-[#28282d] border-l-4 border-green-400" : "hover:bg-[#222226]"}`}>
                        <AlertCircle className={`h-4 w-4 ${pathname === "/submit-grievance" ? "text-green-400" : "text-gray-400 group-hover:text-green-300"}`} />
                        <span>Submit Grievance</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/grievance-dashboard"}>
                      <Link href="/grievance-dashboard" className={`group flex items-center gap-2 px-3 py-2 rounded transition-colors ${pathname === "/grievance-dashboard" ? "bg-[#28282d] border-l-4 border-green-400" : "hover:bg-[#222226]"}`}>
                        <BarChart3 className={`h-4 w-4 ${pathname === "/grievance-dashboard" ? "text-green-400" : "text-gray-400 group-hover:text-green-300"}`} />
                        <span>My Grievances</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/voting"}>
                      <Link href="/voting" className={`group flex items-center gap-2 px-3 py-2 rounded transition-colors ${pathname === "/voting" ? "bg-[#28282d] border-l-4 border-green-400" : "hover:bg-[#222226]"}`}>
                        <Vote className={`h-4 w-4 ${pathname === "/voting" ? "text-green-400" : "text-gray-400 group-hover:text-green-300"}`} />
                        <span>Voting & Governance</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/profile"}>
                      <Link href="/profile" className={`group flex items-center gap-2 px-3 py-2 rounded transition-colors ${pathname === "/profile" ? "bg-[#28282d] border-l-4 border-green-400" : "hover:bg-[#222226]"}`}>
                        <User className={`h-4 w-4 ${pathname === "/profile" ? "text-green-400" : "text-gray-400 group-hover:text-green-300"}`} />
                        <span>Profile</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/emergency" className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      <span>Emergency</span>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              )}

              {/* Worker Navigation */}
              {userRole === "worker" && (
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/task-marketplace"}>
                      <Link href="/task-marketplace" className={`group flex items-center gap-2 px-3 py-2 rounded transition-colors ${pathname === "/task-marketplace" ? "bg-[#28282d] border-l-4 border-green-400" : "hover:bg-[#222226]"}`}>
                        <Briefcase className={`h-4 w-4 ${pathname === "/task-marketplace" ? "text-green-400" : "text-gray-400 group-hover:text-green-300"}`} />
                        <span>Task Marketplace</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/worker-dashboard"}>
                      <Link href="/worker-dashboard" className={`group flex items-center gap-2 px-3 py-2 rounded transition-colors ${pathname === "/worker-dashboard" ? "bg-[#28282d] border-l-4 border-green-400" : "hover:bg-[#222226]"}`}>
                        <BarChart3 className={`h-4 w-4 ${pathname === "/worker-dashboard" ? "text-green-400" : "text-gray-400 group-hover:text-green-300"}`} />
                        <span>Worker Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/reputation"}>
                      <Link href="/reputation" className={`group flex items-center gap-2 px-3 py-2 rounded transition-colors ${pathname === "/reputation" ? "bg-[#28282d] border-l-4 border-green-400" : "hover:bg-[#222226]"}`}>
                        <Award className={`h-4 w-4 ${pathname === "/reputation" ? "text-green-400" : "text-gray-400 group-hover:text-green-300"}`} />
                        <span>Reputation Profile</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              )}

              {/* DAO Member Navigation */}
              {userRole === "dao" && (
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/governance-dashboard"}>
                      <Link href="/governance-dashboard" className={`group flex items-center gap-2 px-3 py-2 rounded transition-colors ${pathname === "/governance-dashboard" ? "bg-[#28282d] border-l-4 border-green-400" : "hover:bg-[#222226]"}`}>
                        <Building className={`h-4 w-4 ${pathname === "/governance-dashboard" ? "text-green-400" : "text-gray-400 group-hover:text-green-300"}`} />
                        <span>Governance Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dao-bids"}>
                      <Link href="/dao-bids" className={`group flex items-center gap-2 px-3 py-2 rounded transition-colors ${pathname === "/dao-bids" ? "bg-[#28282d] border-l-4 border-green-400" : "hover:bg-[#222226]"}`}>
                        <DollarSign className={`h-4 w-4 ${pathname === "/dao-bids" ? "text-green-400" : "text-gray-400 group-hover:text-green-300"}`} />
                        <span>Bids</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              )}

              {/* Admin Navigation */}
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
              <div className="flex flex-col gap-2">
                {/* Wallet info at the bottom if connected */}
                <WalletSidebarInfo />
                {/* Role Switcher (for demo purposes) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span>Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleRoleChange("citizen")}>Citizen</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange("worker")}>Worker</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange("dao")}>DAO Member</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SidebarFooter>
          </Sidebar>
        </div>

        {/* Content area */}
        <div className="flex flex-col w-full ml-64">
          {/* Fixed Header */}
          <header className="fixed top-0 right-0 z-30 h-16 w-[calc(100%-16rem)] flex items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-4">
              {/* Wallet status/address in header */}
              <WalletHeaderInfo />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* Disconnect option if wallet connected */}
                  <WalletDropdownDisconnect />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Scrollable Content Area */}
          <main className="pt-16 h-screen overflow-y-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}