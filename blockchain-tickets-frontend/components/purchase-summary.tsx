"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Event } from "@/types/event"
import { Coins, Calendar, MapPin, Ticket, Loader2 } from "lucide-react"

interface PurchaseSummaryProps {
  event: Event
  selectedSeat: number | null
  isProcessing: boolean
  onPurchase: () => void
}

export function PurchaseSummary({ event, selectedSeat, isProcessing, onPurchase }: PurchaseSummaryProps) {
  const eventDate = new Date(event.date)
  const ticketPrice = Number.parseFloat(event.ticketPrice)
  const platformFee = 0 // No platform fees for blockchain tickets
  const totalPrice = ticketPrice + platformFee

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Purchase Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Event info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-balance">{event.name}</h3>

          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              {eventDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              {event.venue}
            </div>

            {selectedSeat && (
              <div className="flex items-center gap-2">
                <Ticket className="h-3 w-3" />
                Seat {selectedSeat}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Price breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Ticket Price</span>
            <span className="flex items-center gap-1">
              <Coins className="h-3 w-3" />
              {event.ticketPrice} ETH
            </span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Platform Fee</span>
            <span>Free</span>
          </div>

          <Separator />

          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="flex items-center gap-1 text-primary">
              <Coins className="h-4 w-4" />
              {totalPrice.toFixed(3)} ETH
            </span>
          </div>
        </div>

        <Separator />

        {/* Purchase button */}
        <div className="space-y-3">
          <Button className="w-full" size="lg" onClick={onPurchase} disabled={!selectedSeat || isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : selectedSeat ? (
              `Purchase Seat ${selectedSeat}`
            ) : (
              "Select a Seat"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">Secure blockchain transaction • Gas fees apply</p>
        </div>

        {/* Benefits */}
        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <div className="font-medium mb-1">Blockchain Benefits:</div>
          <ul className="space-y-1">
            <li>• Fraud-proof ownership</li>
            <li>• Easy transfers</li>
            <li>• No hidden fees</li>
            <li>• Permanent record</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
