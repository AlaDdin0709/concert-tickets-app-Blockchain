"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"


interface SeatSelectorProps {
  totalSeats: number
  takenSeats: number[]
  onSeatSelect: (seatNumber: number | null) => void
  selectedSeat: number | null
}

export function SeatSelector({ totalSeats, takenSeats, onSeatSelect, selectedSeat }: SeatSelectorProps) {
  // Generate seat layout (simplified grid layout)
  const seatLayout = useMemo(() => {
    const seats = []
    const seatsPerRow = Math.ceil(Math.sqrt(totalSeats))
    const totalRows = Math.ceil(totalSeats / seatsPerRow)
    const takenSet = new Set<number>(takenSeats)

    for (let row = 0; row < totalRows; row++) {
      const rowSeats = []
      for (let seat = 0; seat < seatsPerRow; seat++) {
        const seatNumber = row * seatsPerRow + seat + 1
        if (seatNumber <= totalSeats) {
          rowSeats.push({
            number: seatNumber,
            isAvailable: !takenSet.has(seatNumber),
            row: row + 1,
            seatInRow: seat + 1,
          })
        }
      }
      seats.push(rowSeats)
    }
    return seats
  }, [totalSeats, takenSeats])

  const handleSeatClick = (seatNumber: number, isAvailable: boolean) => {
    if (!isAvailable) return
    if (selectedSeat === seatNumber) {
      onSeatSelect(null) // Deselect if clicking the same seat
    } else {
      onSeatSelect(seatNumber)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Select Your Seat</span>
          {selectedSeat && <Badge variant="secondary">Seat {selectedSeat} Selected</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stage indicator */}
        <div className="text-center">
          <div className="mx-auto w-3/4 rounded-t-full bg-gradient-to-r from-primary/20 to-accent/20 py-3 text-sm font-medium text-muted-foreground">
            STAGE
          </div>
        </div>

        {/* Seat map */}
        <div className="space-y-2 overflow-x-auto">
          {seatLayout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1">
              {/* Row label */}
              <div className="flex w-8 items-center justify-center text-xs text-muted-foreground">
                {String.fromCharCode(65 + rowIndex)}
              </div>

              {/* Seats in row */}
              {row.map((seat) => (
                <Button
                  key={seat.number}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 text-xs transition-all duration-200",
                    !seat.isAvailable && "cursor-not-allowed opacity-50 bg-destructive/20 border-destructive/50",
                    seat.isAvailable &&
                      selectedSeat === seat.number &&
                      "bg-primary text-primary-foreground border-primary",
                    seat.isAvailable && selectedSeat !== seat.number && "hover:bg-accent hover:text-accent-foreground",
                  )}
                  onClick={() => handleSeatClick(seat.number, seat.isAvailable)}
                  disabled={!seat.isAvailable}
                  title={`Seat ${seat.number} - ${seat.isAvailable ? "Available" : "Taken"}`}
                >
                  {seat.seatInRow}
                </Button>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-border bg-background" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-primary bg-primary" />
            <span className="text-muted-foreground">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-destructive/50 bg-destructive/20" />
            <span className="text-muted-foreground">Taken</span>
          </div>
        </div>

        {/* Seat info */}
        {selectedSeat && (
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-sm font-medium">Selected: Seat {selectedSeat}</p>
            <p className="text-xs text-muted-foreground">
              Row {String.fromCharCode(64 + Math.ceil(selectedSeat / Math.ceil(Math.sqrt(totalSeats))))}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
