"use client"

import Image from "next/image"
import { Listing } from "@/generated/prisma/client"

const isDevelopment = process.env.NODE_ENV === "development"

function getListingImage(listing: Listing): string {
  const fallbackImage = "https://placekeanu.com/500"
  
  if (!listing.images || !Array.isArray(listing.images) || listing.images.length === 0) {
    if (isDevelopment) {
      console.warn(`[DEV] Listing ${listing.id} has no images, using fallback`, {
        listingId: listing.id,
        title: listing.title,
        address: listing.address,
        images: listing.images,
      })
    }
    return fallbackImage
  }

  const firstImage = listing.images[0]
  if (!firstImage || typeof firstImage !== "string") {
    if (isDevelopment) {
      console.warn(`[DEV] Listing ${listing.id} has invalid first image`, {
        listingId: listing.id,
        title: listing.title,
        firstImage,
        images: listing.images,
      })
    }
    return fallbackImage
  }

  if (isDevelopment) {
    console.debug(`[DEV] Using image for listing ${listing.id}:`, {
      listingId: listing.id,
      imageUrl: firstImage,
      totalImages: listing.images.length,
    })
  }

  return firstImage
}

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
              src={getListingImage(listing)}
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
              <p className="text-lg font-semibold"> {listing.price.toLocaleString()}/mo</p>
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
