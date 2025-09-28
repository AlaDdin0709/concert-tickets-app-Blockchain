"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Event } from "@/types/event"
import { Calendar, MapPin, Users, Coins } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date)
  const isLowAvailability = event.availableSeats < event.totalSeats * 0.1
  const availabilityPercentage = (event.availableSeats / event.totalSeats) * 100
  // Fallback images located in public/
  const fallbackImages = [
    "/electronic-music-festival-stage-lights.jpg",
    "/hip-hop-concert-with-rapper-on-stage.jpg",
    "/jazz-club-with-saxophone-player.jpg",
    "/rock-concert-stage-with-crowd.jpg",
  ]
  const fallbackIndex = event?.id ? Number(event.id) % fallbackImages.length : 0
  const imageSrc = event.image || fallbackImages[fallbackIndex]

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={imageSrc}
          alt={event.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category badge */}
        {event.category && (
          <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground">{event.category}</Badge>
        )}

        {/* Availability indicator */}
        {isLowAvailability && (
          <Badge variant="destructive" className="absolute top-3 right-3">
            Almost Sold Out
          </Badge>
        )}
      </div>

      <CardContent className="p-6">
        <h3 className="mb-2 text-xl font-bold text-balance group-hover:text-primary transition-colors">{event.name}</h3>

        {event.description && <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{event.description}</p>}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {eventDate.toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {event.venue}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {event.availableSeats.toLocaleString()} / {event.totalSeats.toLocaleString()} available
          </div>
        </div>

        {/* Availability bar */}
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Availability</span>
            <span>{availabilityPercentage.toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                availabilityPercentage > 50
                  ? "bg-chart-4"
                  : availabilityPercentage > 20
                    ? "bg-chart-5"
                    : "bg-destructive"
              }`}
              style={{ width: `${availabilityPercentage}%` }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between p-6 pt-0">
        <div className="flex items-center gap-1">
          <Coins className="h-4 w-4 text-primary" />
          <span className="text-lg font-bold text-primary">{event.ticketPrice} ETH</span>
        </div>

        <Link href={`/events/${event.id}`}>
          <Button className="gap-2">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
