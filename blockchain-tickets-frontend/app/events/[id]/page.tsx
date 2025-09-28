"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEvents } from "@/hooks/use-events"
import { useParams, useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { Calendar, MapPin, Users, Coins, ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { events } = useEvents()
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])

  const event = useMemo(() => {
    const eventId = Number.parseInt(params.id as string)
    return events.find((e) => e.id === eventId)
  }, [events, params.id])

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="px-6 py-8 mx-auto max-w-7xl">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-4">The event you're looking for doesn't exist.</p>
            <Link href="/events">
              <Button>Back to Events</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const eventDate = new Date(event.date)
  const isLowAvailability = event.availableSeats < event.totalSeats * 0.1

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="px-6 py-8 mx-auto max-w-7xl">
        {/* Back button */}
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero image */}
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src={event.image || "/placeholder.svg?height=400&width=800&query=concert stage"}
                alt={event.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {event.category && (
                <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground">{event.category}</Badge>
              )}

              {isLowAvailability && (
                <Badge variant="destructive" className="absolute top-4 right-4">
                  Almost Sold Out
                </Badge>
              )}
            </div>

            {/* Event details */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">{event.name}</h1>

              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {eventDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {event.venue}
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {event.availableSeats.toLocaleString()} / {event.totalSeats.toLocaleString()} available
                </div>
              </div>

              {event.description && (
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                </div>
              )}
            </div>

            {/* Organizer info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm text-muted-foreground">{event.organizer}</div>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <ExternalLink className="h-3 w-3" />
                    View on Etherscan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Purchase Tickets</span>
                  <div className="flex items-center gap-1 text-primary">
                    <Coins className="h-4 w-4" />
                    <span className="text-xl font-bold">{event.ticketPrice} ETH</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Availability indicator */}
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Availability</span>
                    <span className="font-medium">{((event.availableSeats / event.totalSeats) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        event.availableSeats > event.totalSeats * 0.5
                          ? "bg-chart-4"
                          : event.availableSeats > event.totalSeats * 0.2
                            ? "bg-chart-5"
                            : "bg-destructive"
                      }`}
                      style={{ width: `${(event.availableSeats / event.totalSeats) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>{event.availableSeats.toLocaleString()} tickets remaining</p>
                </div>

                <Link href={`/events/${event.id}/purchase`}>
                  <Button className="w-full" size="lg" disabled={event.availableSeats === 0}>
                    {event.availableSeats === 0 ? "Sold Out" : "Buy Tickets"}
                  </Button>
                </Link>

                <p className="text-xs text-muted-foreground text-center">
                  Secure blockchain transaction • No hidden fees
                </p>
              </CardContent>
            </Card>

            {/* Event stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Capacity</span>
                  <span className="font-medium">{event.totalSeats.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tickets Sold</span>
                  <span className="font-medium">{(event.totalSeats - event.availableSeats).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Ticket Price</span>
                  <span className="font-medium">{event.ticketPrice} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Event ID</span>
                  <span className="font-mono text-sm">{event.id}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
