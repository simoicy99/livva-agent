"use client"

import { useState, useTransition } from "react"
import { fetchRealtimeListings } from "../actions/realtime-search"
import type { RoomListing } from "../actions/room-listings"
import { RefreshCw } from "lucide-react"

interface RealtimeSearchButtonProps {
  onResults: (listings: RoomListing[]) => void
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
        const result = await fetchRealtimeListings(maxPrice, city)
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
        <button
          onClick={handleSearch}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <RefreshCw
            className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`}
          />
          {isPending ? "Fetching Real-time Data..." : "Aggregate Real-time Data"}
        </button>
        {lastUpdated && (
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}
    </div>
  )
}
