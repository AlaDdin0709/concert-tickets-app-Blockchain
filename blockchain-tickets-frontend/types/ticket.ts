export interface Ticket {
  id: number
  eventId: number
  seatNumber: number
  owner: string
  isUsed: boolean
  purchaseDate?: number
  transactionHash?: string
}

export interface PurchaseData {
  eventId: number
  seatNumber: number
  ticketPrice: string
  totalPrice: string
}

// Re-export Event type for convenience
export type { Event } from "./event"
