"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TransferTicketDialog } from "@/components/transfer-ticket-dialog"
import type { Ticket } from "@/types/ticket"
import { Calendar, MapPin, TicketIcon, ExternalLink, CheckCircle, Clock, ArrowRightLeft } from "lucide-react"
import { useState } from "react"
import { useTickets } from "@/hooks/use-tickets"
import { useEvents } from "@/hooks/use-events"
import { toast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface TicketCardProps {
  ticket: Ticket
}

export function TicketCard({ ticket }: TicketCardProps) {
  const { useTicket } = useTickets()
  const { events } = useEvents()
  const [isUsing, setIsUsing] = useState(false)
  const event = events.find((e) => e.id === ticket.eventId)
  const purchaseDate = ticket.purchaseDate ? new Date(ticket.purchaseDate) : null

  const handleUseTicket = async () => {
    setIsUsing(true)
    const success = await useTicket(ticket.id)
    setIsUsing(false)
  }

  if (!event) {
    return (
      <Card className="opacity-50">
        <CardContent className="p-6">
          <p className="text-muted-foreground">Event information not available</p>
        </CardContent>
      </Card>
    )
  }

  const eventDate = new Date(event.date)
  const isPastEvent = eventDate < new Date()

  return (
    <Card
      className={`transition-all duration-300 hover:shadow-lg ${ticket.isUsed ? "opacity-75" : "hover:-translate-y-1"}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-balance leading-tight">{event.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {event.venue}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {ticket.isUsed ? (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Used
              </Badge>
            ) : isPastEvent ? (
              <Badge variant="destructive">Expired</Badge>
            ) : (
              <Badge variant="default" className="gap-1">
                <Clock className="h-3 w-3" />
                Valid
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Event details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {eventDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <TicketIcon className="h-4 w-4 text-muted-foreground" />
            <span>Seat {ticket.seatNumber}</span>
          </div>
        </div>

        {/* Ticket info */}
        <div className="rounded-lg bg-muted/50 p-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Ticket ID</span>
            <span className="font-mono">#{ticket.id}</span>
          </div>

          {purchaseDate && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Purchased</span>
              <span>{purchaseDate.toLocaleDateString()}</span>
            </div>
          )}

          {ticket.transactionHash && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Transaction</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                onClick={() => {
                  navigator.clipboard.writeText(ticket.transactionHash!)
                  toast({
                    title: "Copied",
                    description: "Transaction hash copied to clipboard",
                  })
                }}
              >
                {ticket.transactionHash.slice(0, 6)}...{ticket.transactionHash.slice(-4)}
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex w-full gap-2">
          {!ticket.isUsed && !isPastEvent && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex-1 bg-transparent" disabled={isUsing}>
                    {isUsing ? "Using..." : "Use Ticket"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Use Ticket</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to mark this ticket as used? This action cannot be undone and will
                      permanently mark the ticket as redeemed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUseTicket}>Use Ticket</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <TransferTicketDialog ticket={ticket} eventName={event.name}>
                <Button variant="secondary" className="flex-1 gap-2">
                  <ArrowRightLeft className="h-4 w-4" />
                  Transfer
                </Button>
              </TransferTicketDialog>
            </>
          )}

          {/* Show only view event button for used/expired tickets */}
          {(ticket.isUsed || isPastEvent) && (
            <Button variant="secondary" className="w-full" asChild>
              <a href={`/events/${event.id}`}>View Event</a>
            </Button>
          )}

          {/* Show view event button alongside action buttons for valid tickets */}
          {!ticket.isUsed && !isPastEvent && (
            <Button variant="ghost" size="sm" asChild>
              <a href={`/events/${event.id}`}>View Event</a>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
