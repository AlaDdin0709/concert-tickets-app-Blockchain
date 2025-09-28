"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SeatSelector } from "@/components/seat-selector"
import { PurchaseSummary } from "@/components/purchase-summary"
import { useEvents } from "@/hooks/use-events"
import { useTickets } from "@/hooks/use-tickets"
import { useWeb3 } from "@/contexts/web3-context"
import { useParams, useRouter } from "next/navigation"
import { useState, useMemo, useEffect } from "react"
import { useTakenSeats } from "@/hooks/use-taken-seats"
import { ArrowLeft, Shield, Zap, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function PurchasePage() {
  const params = useParams()
  const router = useRouter()
  const { events } = useEvents()
  const { buyTicket } = useTickets()
  const { isConnected, account } = useWeb3()

  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [purchaseComplete, setPurchaseComplete] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)


  const [takenSeats, setTakenSeats] = useState<number[]>([])

  // Define event before any hooks that use it
  const event = useMemo(() => {
    const eventId = Number.parseInt(params.id as string)
    return events.find((e) => e.id === eventId)
  }, [events, params.id])

  const { fetchTakenSeats } = useTakenSeats(event ? event.id : null, event ? event.totalSeats : 0)

  // Fetch taken seats when event changes
  useEffect(() => {
    let ignore = false
    async function load() {
      if (event) {
        const taken = await fetchTakenSeats()
        if (!ignore) setTakenSeats(taken)
      }
    }
    load()
    return () => { ignore = true }
  }, [event, fetchTakenSeats])

  const handlePurchase = async () => {
    if (!event || !selectedSeat || !isConnected) return

    setIsProcessing(true)

    const result = await buyTicket(event.id, selectedSeat, event.ticketPrice)

    if (result.success) {
      setPurchaseComplete(true)
      setTransactionHash(result.transactionHash)
    }

    setIsProcessing(false)
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="px-6 py-8 mx-auto max-w-7xl">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-4">The event you're trying to purchase tickets for doesn't exist.</p>
            <Link href="/events">
              <Button>Back to Events</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="px-6 py-8 mx-auto max-w-7xl">
          <div className="text-center py-20">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-4">Wallet Connection Required</h1>
            <p className="text-muted-foreground mb-6">
              Please connect your Ethereum wallet to purchase tickets securely on the blockchain.
            </p>
            <Link href={`/events/${event.id}`}>
              <Button>Back to Event</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (purchaseComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="px-6 py-8 mx-auto max-w-7xl">
          <div className="text-center py-20">
            <CheckCircle className="mx-auto h-16 w-16 text-chart-4 mb-6" />
            <h1 className="text-3xl font-bold mb-4">Purchase Successful!</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Your ticket for {event.name} (Seat {selectedSeat}) has been successfully purchased and recorded on the
              blockchain.
            </p>

            {transactionHash && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">Transaction Hash:</p>
                <code className="text-xs bg-muted px-3 py-1 rounded font-mono">{transactionHash}</code>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Link href="/tickets">
                <Button>View My Tickets</Button>
              </Link>
              <Link href="/events">
                <Button variant="outline">Browse More Events</Button>
              </Link>

            </div>
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
          <Button variant="ghost" className="mb-4 gap-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back to Event
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Purchase Tickets</h1>
          </div>
          <p className="text-muted-foreground">Select your seat and complete your secure blockchain purchase</p>
        </div>

        {/* Main content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Seat selection */}
          <div className="lg:col-span-2 space-y-6">
            <SeatSelector
              totalSeats={event.totalSeats}
              takenSeats={takenSeats}
              onSeatSelect={setSelectedSeat}
              selectedSeat={selectedSeat}
            />

            {/* Security info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Blockchain Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Your ticket will be minted as a unique NFT on the Ethereum blockchain, providing:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Immutable proof of ownership</li>
                  <li>• Protection against counterfeiting</li>
                  <li>• Easy and secure transfers</li>
                  <li>• Transparent transaction history</li>
                </ul>
                <p className="text-xs">
                  Connected wallet: <code className="bg-muted px-1 rounded">{account}</code>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Purchase summary */}
          <div>
            <PurchaseSummary
              event={event}
              selectedSeat={selectedSeat}
              isProcessing={isProcessing}
              onPurchase={handlePurchase}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
