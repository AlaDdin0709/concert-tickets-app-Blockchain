"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { TransferForm } from "@/components/transfer-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/contexts/web3-context"
import { ArrowRightLeft, Shield, Zap, Users, Wallet } from "lucide-react"
import Link from "next/link"

export default function TransferPage() {
  const { isConnected } = useWeb3()

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container px-6 py-8">
          <div className="text-center py-20 max-w-2xl mx-auto">
            <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-6">
              Please connect your Ethereum wallet to transfer tickets securely on the blockchain.
            </p>
            <Link href="/events">
              <Button>Browse Events</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="px-6 py-8 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ArrowRightLeft className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Transfer Tickets</h1>
          </div>
          <p className="text-muted-foreground">
            Securely transfer your blockchain tickets to friends, family, or other collectors.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Transfer form */}
          <div className="lg:col-span-2">
            <TransferForm />
          </div>

          {/* Information sidebar */}
          <div className="space-y-6">
            {/* How it works */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How Transfers Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Select Your Ticket</p>
                    <p>Choose from your valid, unused tickets for upcoming events.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Enter Recipient Address</p>
                    <p>Provide the Ethereum wallet address of the person receiving the ticket.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Confirm Transfer</p>
                    <p>Sign the blockchain transaction to complete the permanent transfer.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transfer Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Secure & Transparent</p>
                    <p className="text-sm text-muted-foreground">All transfers are recorded on the blockchain</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium">Instant Ownership</p>
                    <p className="text-sm text-muted-foreground">Recipients get immediate ticket ownership</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-chart-4" />
                  <div>
                    <p className="font-medium">No Middleman</p>
                    <p className="text-sm text-muted-foreground">Direct peer-to-peer transfers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important notes */}
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-lg text-destructive">Important Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Transfers are permanent and cannot be reversed</p>
                <p>• Only valid tickets for upcoming events can be transferred</p>
                <p>• Used or expired tickets cannot be transferred</p>
                <p>• Double-check recipient addresses before confirming</p>
                <p>• Gas fees apply for blockchain transactions</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
