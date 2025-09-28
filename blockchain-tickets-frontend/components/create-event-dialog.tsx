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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEvents } from "@/hooks/use-events"
import { useWeb3 } from "@/contexts/web3-context"
import type { EventFormData } from "@/types/event"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const categories = [
  "Electronic",
  "Rock",
  "Pop",
  "Hip-Hop",
  "Jazz",
  "Classical",
  "Country",
  "R&B",
  "Alternative",
  "Other",
]

export function CreateEventDialog() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createEvent } = useEvents()
  const { isConnected, account } = useWeb3()

  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    venue: "",
    date: "",
    ticketPrice: "",
    totalSeats: 100,
    description: "",
    category: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create events.",
        variant: "destructive",
      })
      return
    }

    // Validation
    if (!formData.name || !formData.venue || !formData.date || !formData.ticketPrice) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const eventDate = new Date(formData.date).getTime()
    if (eventDate <= Date.now()) {
      toast({
        title: "Invalid Date",
        description: "Event date must be in the future.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const success = await createEvent({
        name: formData.name,
        venue: formData.venue,
        date: Math.floor(eventDate / 1000), // Convert to Unix timestamp
        ticketPrice: formData.ticketPrice,
        totalSeats: formData.totalSeats,
      })

      if (success) {
        setOpen(false)
        setFormData({
          name: "",
          venue: "",
          date: "",
          ticketPrice: "",
          totalSeats: 100,
          description: "",
          category: "",
        })
      }
    } catch (error) {
      console.error("Error creating event:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof EventFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!isConnected) {
    return (
      <Button disabled className="gap-2">
        <Plus className="h-4 w-4" />
        Connect Wallet to Create Event
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Create a new concert event on the blockchain. All information will be stored immutably.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Amazing Concert 2025"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue *</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => handleInputChange("venue", e.target.value)}
                placeholder="Madison Square Garden"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Event Date & Time *</Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ticketPrice">Ticket Price (ETH) *</Label>
              <Input
                id="ticketPrice"
                type="number"
                step="0.001"
                min="0"
                value={formData.ticketPrice}
                onChange={(e) => handleInputChange("ticketPrice", e.target.value)}
                placeholder="0.1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalSeats">Total Seats *</Label>
              <Input
                id="totalSeats"
                type="number"
                min="1"
                value={formData.totalSeats}
                onChange={(e) => handleInputChange("totalSeats", Number.parseInt(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your event..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
