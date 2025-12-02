"use client"

import Image from "next/image"
import { Listing } from "@/generated/prisma/client"

interface RoomListingsProps {
  listings: Listing[]
}

export function RoomListings({ listings }: RoomListingsProps) {
  if (listings.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          No listings found. Please try adjusting your search criteria.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <div
          key={listing.id}
          className="flex flex-col rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover"
            />
            <div className="absolute right-2 top-2 rounded bg-background/90 px-2 py-1 text-xs font-medium">
              {listing.unit_type}
            </div>
          </div>

          <div className="flex flex-1 flex-col p-4">
            <div className="mb-2">
              <p className="text-lg font-semibold">${listing.price.toLocaleString()}/mo</p>
                <p className="text-sm text-muted-foreground">{listing.address}</p>
            </div>

            <p className="mb-4 flex-1 text-sm">{listing.summary}</p>

            <div className="mt-auto border-t pt-4">
              <a
                href={listing.listing_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                View on {new URL(listing.listing_link).hostname} →
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
