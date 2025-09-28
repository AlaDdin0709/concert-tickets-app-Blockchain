"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWeb3 } from "@/contexts/web3-context"
import { ArrowRight, Shield, Zap, Users } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const { isConnected } = useWeb3()

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />

      <div className="container relative px-6 mx-auto">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 gap-2 px-4 py-2">
            <Zap className="h-3 w-3" />
            Powered by Ethereum Blockchain
          </Badge>

          {/* Main heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance sm:text-6xl md:text-7xl">
            The Future of{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Concert Tickets
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground text-pretty md:text-xl">
            Secure, transparent, and fraud-proof concert tickets on the blockchain. Buy, sell, and transfer tickets with
            complete ownership and authenticity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            {isConnected ? (
              <Link href="/events">
                <Button size="lg" className="gap-2 text-base">
                  Browse Events
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button size="lg" className="gap-2 text-base" disabled>
                Connect Wallet to Start
              </Button>
            )}
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-base bg-transparent">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-20 grid gap-6 md:grid-cols-3">
          <Card className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Fraud Protection</h3>
            <p className="text-sm text-muted-foreground">
              Every ticket is a unique NFT on the blockchain, making counterfeiting impossible.
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <ArrowRight className="h-6 w-6 text-accent" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Easy Transfers</h3>
            <p className="text-sm text-muted-foreground">
              Transfer tickets directly to friends or sell on secondary markets with full transparency.
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10">
              <Users className="h-6 w-6 text-chart-4" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">True Ownership</h3>
            <p className="text-sm text-muted-foreground">
              You own your tickets completely - no middleman can revoke or modify them.
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}
