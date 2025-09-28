"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Ticket } from "@/types/ticket"
import type { Event } from "@/types/event"
import { TicketIcon, Calendar, TrendingUp, Clock } from "lucide-react"

interface TicketStatsProps {
  tickets: Ticket[]
  events: Event[]
}

export function TicketStats({ tickets, events }: TicketStatsProps) {
  const totalTickets = tickets.length
  const usedTickets = tickets.filter((t) => t.isUsed).length
  const upcomingTickets = tickets.filter((t) => {
    const event = events.find((e) => e.id === t.eventId)
    return event && new Date(event.date) > new Date() && !t.isUsed
  }).length

  const totalValue = tickets.reduce((sum, ticket) => {
    const event = events.find((e) => e.id === ticket.eventId)
    return sum + (event ? Number.parseFloat(event.ticketPrice) : 0)
  }, 0)

  const stats = [
    {
      title: "Total Tickets",
      value: totalTickets.toString(),
      icon: TicketIcon,
      description: "All time purchases",
    },
    {
      title: "Upcoming Events",
      value: upcomingTickets.toString(),
      icon: Calendar,
      description: "Valid tickets",
    },
    {
      title: "Used Tickets",
      value: usedTickets.toString(),
      icon: Clock,
      description: "Redeemed tickets",
    },
    {
      title: "Total Value",
      value: `${totalValue.toFixed(3)} ETH`,
      icon: TrendingUp,
      description: "Portfolio value",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
