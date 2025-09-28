export interface Event {
  id: number
  name: string
  venue: string
  date: number // Unix timestamp
  ticketPrice: string // In ETH
  totalSeats: number
  availableSeats: number
  organizer: string
  description?: string
  image?: string
  category?: string
}

export interface EventFormData {
  name: string
  venue: string
  date: string
  ticketPrice: string
  totalSeats: number
  description: string
  category: string
}
