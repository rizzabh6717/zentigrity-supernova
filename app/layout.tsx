import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import NavbarWithWallet from "./NavbarWithWallet";

const inter = Inter({ subsets: ["latin"] })

import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "ZENTIGRITY",
  description: "A platform for citizens, workers, and DAO members to resolve local issues",
    generator: 'Nungambakkam Knight Riders'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body className={inter.className}>
      {/* Sticky Animated Navbar */}
      {/* Client-side Navbar Wallet Logic */}
      <NavbarWithWallet />

      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <Toaster />
    </ThemeProvider>
    </body>
  </html>
  )
}
