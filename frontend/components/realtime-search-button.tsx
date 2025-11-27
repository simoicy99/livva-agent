"use client"

import { useState, useTransition } from "react"
import { searchRoomListings, type SearchFilters } from "@/app/actions/room-listings"
import type { Listing } from "@/lib/type"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RealtimeSearchButtonProps {
  onResults: (listings: Listing[]) => void
  maxPrice?: number
  city?: string
}

export function RealtimeSearchButton({
  onResults,
  maxPrice = 1500,
  city = "San Francisco",
}: RealtimeSearchButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const handleSearch = () => {
    setError(null)
    startTransition(async () => {
      try {
        const filters: SearchFilters = {
          maxPrice,
          city,
        }
        const result = await searchRoomListings(filters)
        if (result.success && result.data) {
          onResults(result.data)
          setLastUpdated(new Date())
        } else {
          setError(result.error || "Failed to fetch listings")
        }
      } catch (err) {
        setError("An unexpected error occurred")
        console.error("Error in real-time search:", err)
      }
    })
  }

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <Button onClick={handleSearch} disabled={isPending}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`}
          />
          {isPending ? "Fetching Real-time Data..." : "Aggregate Real-time Data"}
        </Button>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  )
}
