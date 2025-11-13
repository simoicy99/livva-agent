"use client"

import type { RoomListing } from "../actions/room-listings"

interface RoomListingsProps {
  listings: RoomListing[]
}

export function RoomListings({ listings }: RoomListingsProps) {
  if (listings.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">
          No room listings found. Please try adjusting your search criteria or
          click the button to fetch real-time data.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing, index) => (
        <div
          key={index}
          className="flex flex-col rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-4">
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-zinc-50">
              {listing.title}
            </h2>
            <div className="mb-2 text-2xl font-bold text-green-600 dark:text-green-400">
              ${listing.price.toLocaleString()}
              <span className="ml-1 text-sm font-normal text-zinc-600 dark:text-zinc-400">
                /month
              </span>
            </div>
            {listing.size && (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Size: {listing.size}
              </div>
            )}
          </div>

          <div className="mb-4 flex-1">
            <p className="mb-2 text-sm text-zinc-700 dark:text-zinc-300">
              <strong>Address:</strong> {listing.address}
            </p>
            {listing.description && (
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {listing.description}
              </p>
            )}
          </div>

          <div className="mt-auto border-t border-zinc-200 pt-4 dark:border-zinc-800">
            {listing.link && (
              <a
                href={listing.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-2 block text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View on {listing.source || "Zillow"} →
              </a>
            )}
            {listing.source && (
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                Source: {listing.source}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
