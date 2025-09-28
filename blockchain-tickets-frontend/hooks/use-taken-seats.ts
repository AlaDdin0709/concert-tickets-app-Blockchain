import { useWeb3 } from "@/contexts/web3-context"
import { useCallback } from "react"

// Returns a list of taken seat numbers for a given eventId
export function useTakenSeats(eventId: number | null, totalSeats: number) {
  const { contract } = useWeb3()

  // Returns a promise that resolves to an array of taken seat numbers
  const fetchTakenSeats = useCallback(async () => {
    if (!contract || !eventId) return []
    const taken: number[] = []
    // Query all seats for this event
    for (let seat = 1; seat <= totalSeats; seat++) {
      try {
        const isTaken = await contract.methods.seatTaken(eventId, seat).call()
        if (isTaken) taken.push(seat)
      } catch (e) {
        // ignore
      }
    }
    return taken
  }, [contract, eventId, totalSeats])

  return { fetchTakenSeats }
}
