"use client"


import { useState, useEffect } from "react"
import { useWeb3 } from "@/contexts/web3-context"
import type { Event } from "@/types/event"
import { toast } from "@/hooks/use-toast"

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { contract, account, isConnected, web3 } = useWeb3()

  // Fetch events from smart contract
  const fetchEvents = async () => {
    if (!contract || !isConnected) return

    setIsLoading(true)
    try {
      // Get all active event IDs
      const eventIds: string[] = await contract.methods.getActiveEvents().call()
      const eventsList: Event[] = []

      for (const id of eventIds) {
        const event = await contract.methods.getEvent(id).call()
        // The contract returns ticketPrice, date, totalSeats, availableSeats as uint256 (BN or string)
        // Normalize returned date: detect if the contract gave seconds or ms.
        const rawDateNum = Number(event.date)
        const dateMs = rawDateNum > 1e12 ? rawDateNum : rawDateNum * 1000

        eventsList.push({
          id: Number(event.id),
          name: event.name,
          venue: event.venue,
          date: dateMs,
          ticketPrice: web3 ? web3.utils.fromWei(event.ticketPrice, "ether") : event.ticketPrice, // string in ETH
          totalSeats: Number(event.totalSeats),
          availableSeats: event.availableSeats !== undefined ? Number(event.availableSeats) : (Number(event.totalSeats) - Number(event.soldTickets || 0)),
          organizer: event.organizer,
        })
      }
      setEvents(eventsList)
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Create new event
  const createEvent = async (eventData: {
    name: string
    venue: string
    date: number
    ticketPrice: string // in ETH
    totalSeats: number
  }) => {
    if (!contract || !account || !web3) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create events.",
        variant: "destructive",
      })
      return false
    }

    try {
      setIsLoading(true)

      // Convert ticket price from ETH to Wei (string)
      const priceInWei = web3.utils.toWei(eventData.ticketPrice, "ether")

      await contract.methods
        .createEvent(eventData.name, eventData.venue, eventData.date, priceInWei, eventData.totalSeats)
        .send({ from: account })

      toast({
        title: "Event Created",
        description: "Your event has been successfully created on the blockchain.",
      })

      // Refresh events list
      await fetchEvents()
      return true
    } catch (error: any) {
      console.error("Error creating event:", error)
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create event. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Load events on mount and when contract changes
  useEffect(() => {
    if (isConnected && contract) {
      fetchEvents()
    }
  }, [contract, isConnected])

  return {
    events,
    isLoading,
    fetchEvents,
    createEvent,
  }
}

