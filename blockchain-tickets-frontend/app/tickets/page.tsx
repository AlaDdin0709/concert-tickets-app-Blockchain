"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { TicketCard } from "@/components/ticket-card"
import { TicketStats } from "@/components/ticket-stats"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTickets } from "@/hooks/use-tickets"
import { useEvents } from "@/hooks/use-events"
import { useWeb3 } from "@/contexts/web3-context"
import { useState, useMemo } from "react"
import { Search, Filter, TicketIcon, Loader2, Wallet } from "lucide-react"
import Link from "next/link"

const filterOptions = [
  { value: "all", label: "All Tickets" },
  { value: "upcoming", label: "Upcoming Events" },
  { value: "used", label: "Used Tickets" },
  { value: "expired", label: "Expired Tickets" },
]

const sortOptions = [
  { value: "date-desc", label: "Event Date (Newest)" },
  { value: "date-asc", label: "Event Date (Oldest)" },
  { value: "purchase-desc", label: "Purchase Date (Newest)" },
  { value: "purchase-asc", label: "Purchase Date (Oldest)" },
]

export default function TicketsPage() {
  const { tickets, isLoading } = useTickets()
  const { events } = useEvents()
  const { isConnected, account } = useWeb3()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    const filtered = tickets.filter((ticket) => {
      const event = events.find((e) => e.id === ticket.eventId)
      if (!event) return false

      // Search filter
      const matchesSearch =
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toString().includes(searchQuery)

      // Status filter
      const now = new Date()
      const eventDate = new Date(event.date)

      let matchesFilter = true
      switch (filterBy) {
        case "upcoming":
          matchesFilter = !ticket.isUsed && eventDate > now
          break
        case "used":
          matchesFilter = ticket.isUsed
          break
        case "expired":
          matchesFilter = !ticket.isUsed && eventDate < now
          break
        default:
          matchesFilter = true
      }

      return matchesSearch && matchesFilter
    })

    // Sort tickets
    filtered.sort((a, b) => {
      const eventA = events.find((e) => e.id === a.eventId)
      const eventB = events.find((e) => e.id === b.eventId)

      if (!eventA || !eventB) return 0

      switch (sortBy) {
        case "date-desc":
          return eventB.date - eventA.date
        case "date-asc":
          return eventA.date - eventB.date
        case "purchase-desc":
          return (b.purchaseDate || 0) - (a.purchaseDate || 0)
        case "purchase-asc":
          return (a.purchaseDate || 0) - (b.purchaseDate || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [tickets, events, searchQuery, filterBy, sortBy])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container px-6 py-8">
          <div className="text-center py-20 max-w-2xl mx-auto">
            <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-6">Please connect your Ethereum wallet to view your tickets.</p>
            <Link href="/events">
              <Button>Browse Events</Button>
            </Link>
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
          <div className="flex items-center gap-3 mb-2">
            <TicketIcon className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">My Tickets</h1>
          </div>
          <p className="text-muted-foreground">Manage your blockchain-secured concert tickets</p>
          <p className="text-xs text-muted-foreground mt-1">
            Connected: <code className="bg-muted px-1 rounded">{account}</code>
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <TicketStats tickets={tickets} events={events} />
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tickets, events, or venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tickets Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Loading your tickets...</p>
            </div>
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20">
            <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tickets Yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't purchased any tickets yet. Start by browsing available events.
            </p>
            <Link href="/events">
              <Button>Browse Events</Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-20">
            <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Matching Tickets</h3>
            <p className="text-muted-foreground mb-4">No tickets match your current search and filter criteria.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setFilterBy("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Results count */}
        {!isLoading && filteredTickets.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
