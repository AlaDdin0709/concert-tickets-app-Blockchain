"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTickets } from "@/hooks/use-tickets"
import { useEvents } from "@/hooks/use-events"
import { useWeb3 } from "@/contexts/web3-context"
import { ArrowRightLeft, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function TransferForm() {
  const { tickets, transferTicket } = useTickets()
  const { events } = useEvents()
  const { web3, account } = useWeb3()

  const [selectedTicketId, setSelectedTicketId] = useState<string>("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferComplete, setTransferComplete] = useState(false)

  // Filter transferable tickets (not used, not expired)
  const transferableTickets = tickets.filter((ticket) => {
    if (ticket.isUsed) return false
    const event = events.find((e) => e.id === ticket.eventId)
    if (!event) return false
    return new Date(event.date) > new Date()
  })

  const selectedTicket = transferableTickets.find((t) => t.id.toString() === selectedTicketId)
  const selectedEvent = selectedTicket ? events.find((e) => e.id === selectedTicket.eventId) : null

  const isValidAddress = (address: string) => {
    return web3?.utils?.isAddress(address) || false
  }

  const handleTransfer = async () => {
    if (!selectedTicket || !recipientAddress.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a ticket and enter a recipient address.",
        variant: "destructive",
      })
      return
    }

    if (!isValidAddress(recipientAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address.",
        variant: "destructive",
      })
      return
    }

    if (recipientAddress.toLowerCase() === account?.toLowerCase()) {
      toast({
        title: "Invalid Transfer",
        description: "You cannot transfer a ticket to yourself.",
        variant: "destructive",
      })
      return
    }

    setIsTransferring(true)

    const success = await transferTicket(selectedTicket.id, recipientAddress)

    if (success) {
      setTransferComplete(true)
      // Reset form after a delay
      setTimeout(() => {
        setSelectedTicketId("")
        setRecipientAddress("")
        setTransferComplete(false)
      }, 3000)
    }

    setIsTransferring(false)
  }

  const resetForm = () => {
    setSelectedTicketId("")
    setRecipientAddress("")
    setTransferComplete(false)
  }

  if (transferComplete) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-chart-4 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Transfer Successful!</h3>
          <p className="text-muted-foreground mb-4">
            Your ticket has been successfully transferred to{" "}
            <code className="bg-muted px-1 rounded text-xs">
              {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
            </code>
          </p>
          <Button onClick={resetForm}>Transfer Another Ticket</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" />
          Transfer Ticket
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {transferableTickets.length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You don't have any transferable tickets. Only valid, unused tickets for upcoming events can be
              transferred.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Warning */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Ticket transfers are permanent and cannot be undone. Make sure you trust the recipient and have verified
                their address.
              </AlertDescription>
            </Alert>

            {/* Ticket selection */}
            <div className="space-y-2">
              <Label htmlFor="ticket">Select Ticket to Transfer *</Label>
              <Select value={selectedTicketId} onValueChange={setSelectedTicketId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a ticket..." />
                </SelectTrigger>
                <SelectContent>
                  {transferableTickets.map((ticket) => {
                    const event = events.find((e) => e.id === ticket.eventId)
                    return (
                      <SelectItem key={ticket.id} value={ticket.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{event?.name || "Unknown Event"}</span>
                          <span className="text-xs text-muted-foreground">
                            Seat {ticket.seatNumber} • Ticket #{ticket.id}
                          </span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Selected ticket details */}
            {selectedTicket && selectedEvent && (
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <h4 className="font-medium">Selected Ticket Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Event:</span>
                    <div className="font-medium">{selectedEvent.name}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Venue:</span>
                    <div>{selectedEvent.venue}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <div>{new Date(selectedEvent.date).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Seat:</span>
                    <div>{selectedTicket.seatNumber}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Current owner */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Owner</Label>
              <div className="rounded-md bg-muted p-2 font-mono text-sm">{account}</div>
            </div>

            {/* Recipient address */}
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address *</Label>
              <Input
                id="recipient"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="font-mono"
              />
              {recipientAddress && !isValidAddress(recipientAddress) && (
                <p className="text-sm text-destructive">Invalid Ethereum address format</p>
              )}
              {recipientAddress && isValidAddress(recipientAddress) && (
                <p className="text-sm text-chart-4">Valid Ethereum address</p>
              )}
            </div>

            {/* Transfer button */}
            <Button
              onClick={handleTransfer}
              disabled={!selectedTicketId || !recipientAddress || !isValidAddress(recipientAddress) || isTransferring}
              className="w-full"
              size="lg"
            >
              {isTransferring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transferring...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Transfer Ticket
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
