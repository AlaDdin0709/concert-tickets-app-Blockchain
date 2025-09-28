"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTickets } from "@/hooks/use-tickets"
import { useWeb3 } from "@/contexts/web3-context"
import type { Ticket } from "@/types/ticket"
import { ArrowRightLeft, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TransferTicketDialogProps {
  ticket: Ticket
  eventName: string
  children?: React.ReactNode
}

export function TransferTicketDialog({ ticket, eventName, children }: TransferTicketDialogProps) {
  const [open, setOpen] = useState(false)
  const [recipientAddress, setRecipientAddress] = useState("")
  const [isTransferring, setIsTransferring] = useState(false)
  const { transferTicket } = useTickets()
  const { web3, account } = useWeb3()

  const isValidAddress = (address: string) => {
    return web3?.utils?.isAddress(address) || false
  }

  const handleTransfer = async () => {
    if (!recipientAddress.trim()) {
      toast({
        title: "Missing Address",
        description: "Please enter a recipient address.",
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

    const success = await transferTicket(ticket.id, recipientAddress)

    if (success) {
      setOpen(false)
      setRecipientAddress("")
    }

    setIsTransferring(false)
  }

  const resetForm = () => {
    setRecipientAddress("")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) resetForm()
      }}
    >
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <ArrowRightLeft className="h-4 w-4" />
            Transfer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transfer Ticket
          </DialogTitle>
          <DialogDescription>
            Transfer your ticket for "{eventName}" (Seat {ticket.seatNumber}) to another Ethereum address.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This action is permanent and cannot be undone. Make sure you trust the recipient and have verified the
              address.
            </AlertDescription>
          </Alert>

          {/* Current owner */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Owner</Label>
            <div className="rounded-md bg-muted p-2 font-mono text-sm">{ticket.owner}</div>
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

          {/* Ticket details */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ticket ID</span>
              <span className="font-mono">#{ticket.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Event</span>
              <span className="text-right">{eventName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seat</span>
              <span>{ticket.seatNumber}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!recipientAddress || !isValidAddress(recipientAddress) || isTransferring}
            className="w-full sm:w-auto"
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
