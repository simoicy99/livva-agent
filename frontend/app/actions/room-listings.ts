"use server"
import type { Listing } from "@/lib/type"
import listingsData from "@/lib/data.json"

interface SearchResult {
  success: boolean
  data?: Listing[]
  error?: string
}

export interface SearchFilters {
  minPrice?: number
  maxPrice?: number
  city?: string
  keyword?: string
  type?: "studio" | "room" | "apartment" | "all"
  sortBy?: "price-asc" | "price-desc" | "newest"
}

export async function searchRoomListings(
  filters: SearchFilters = {}
): Promise<SearchResult> {
  try {
    const {
      minPrice = 0,
      maxPrice = 5000,
      city = "San Francisco",
      keyword = "",
      type = "all",
      sortBy = "price-asc",
    } = filters

    const listings: Listing[] = listingsData as unknown as Listing[]

    const filteredListings = listings.filter((listing) => {
      if (listing.price < minPrice || listing.price > maxPrice) {
        return false
      }

      if (city && !listing.location.toLowerCase().includes(city.toLowerCase())) {
        return false
      }

      if (type !== "all") {
        const platformMap: Record<string, Listing["platform"]> = {
          studio: "Zillow",
          room: "Redfin",
          apartment: "Apartments.com",
        }
        if (platformMap[type] && listing.platform !== platformMap[type]) {
          return false
        }
      }

      if (keyword) {
        const searchTerm = keyword.toLowerCase()
        const searchableText = [
          listing.location,
          listing.whyItFits,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        if (!searchableText.includes(searchTerm)) {
          return false
        }
      }

      return true
    })

    filteredListings.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "newest":
          return 0
        default:
          return a.price - b.price
      }
    })

    return {
      success: true,
      data: filteredListings,
    }
  } catch (error) {
    console.error("Error searching room listings:", error)
    return {
      success: false,
      error: "Failed to search room listings. Please try again later.",
    }
  }
}

