import type React from "react"
import type { Metadata } from "next"
import { Web3Provider } from "@/contexts/web3-context"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "BlockTix - Blockchain Concert Tickets",
  description: "Secure, transparent concert ticket marketplace on the blockchain",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans">
        <Suspense fallback={null}>
          <Web3Provider>
            {children}
            <Toaster />
          </Web3Provider>
        </Suspense>
      </body>
    </html>
  )
}
