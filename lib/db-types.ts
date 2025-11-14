import type { Listing } from "./type"
import type { SearchFilters } from "@/app/actions/room-listings"

export type ListingMetadata = {
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  amenities?: string[]
  petPolicy?: string
  parking?: boolean
  laundry?: boolean
  [key: string]: unknown
}

export type UserPreferencesData = {
  defaultLocation?: string
  defaultMaxPrice?: number
  preferredNeighborhoods?: string[]
  mustHaves?: string[]
  notifications?: {
    email?: boolean
    newListings?: boolean
    priceDrops?: boolean
  }
  [key: string]: unknown
}

export type SearchSessionMetadata = {
  resultCount?: number
  searchDuration?: number
  [key: string]: unknown
}

export type SavedListingMetadata = {
  tags?: string[]
  reminderDate?: string
  priority?: "high" | "medium" | "low"
  [key: string]: unknown
}

export type ListingCreateInput = {
  platform: Listing["platform"]
  photo: string
  price: number
  location: string
  matchScore: number
  whyItFits: string
  metadata?: ListingMetadata
}

export type SearchSessionCreateInput = {
  userId: string
  filters: SearchFilters
  results?: Listing[]
  metadata?: SearchSessionMetadata
}

export type UserPreferencesCreateInput = {
  userId: string
  preferences: UserPreferencesData
  metadata?: Record<string, unknown>
}

export type SavedListingCreateInput = {
  userId: string
  listingId: string
  notes?: string
  metadata?: SavedListingMetadata
}

