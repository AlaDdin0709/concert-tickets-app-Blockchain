"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface Stat {
  label: string
  value: string
  change?: string
}

export function StatsSection() {
  const [stats, setStats] = useState<Stat[]>([
    { label: "Total Events", value: "0", change: "+0" },
    { label: "Tickets Sold", value: "0", change: "+0" },
    { label: "Active Users", value: "0", change: "+0" },
    { label: "ETH Volume", value: "0", change: "+0" },
  ])

  // In a real app, this would fetch from your smart contract
  useEffect(() => {
    // Simulate loading stats
    const timer = setTimeout(() => {
      setStats([
        { label: "Total Events", value: "8", change: "+12%" },
        { label: "Tickets Sold", value: "21", change: "+8%" },
        { label: "Active Users", value: "3", change: "+15%" },
        { label: "ETH Volume", value: "2.5", change: "+23%" },
      ])
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <section id="features" className="py-20">
      <div className="container px-6 mx-auto">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Trusted by the Community</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of music fans who trust BlockTix for secure ticket transactions.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <Card key={stat.label} className="p-6 text-center">
              <div className="mb-2 text-2xl font-bold text-primary">{stat.value}</div>
              <div className="mb-1 text-sm font-medium text-foreground">{stat.label}</div>
              {stat.change && <div className="text-xs text-accent">{stat.change} this month</div>}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
