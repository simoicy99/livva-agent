"use server"

import { Listing, Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const isDevelopment = process.env.NODE_ENV === "development"

interface SearchResult {
  success: boolean
  data?: Listing[]
  error?: string
}

const searchFiltersSchema = z.object({
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  city: z.string().max(100).optional(),
  keyword: z.string().max(120).optional(),
  type: z.enum(["studio", "room", "apartment", "all"]).optional(),
  sortBy: z.enum(["price-asc", "price-desc", "newest"]).optional(),
})

export interface SearchFilters {
  minPrice?: number
  maxPrice?: number
  city?: string
  keyword?: string
  type?: "studio" | "room" | "apartment" | "all"
  sortBy?: "price-asc" | "price-desc" | "newest"
}

interface NormalizedSearchFilters {
  minPrice?: number
  maxPrice?: number
  city?: string
  keyword?: string
  type?: SearchFilters["type"]
  sortBy: "price-asc" | "price-desc" | "newest"
}

const UNIT_TYPE_MAP: Record<
  Exclude<SearchFilters["type"], undefined | "all">,
  Listing["unit_type"]
> = {
  studio: "Studio",
  room: "Room",
  apartment: "Apartment",
}

const listingSelect = {
  id: true,
  title: true,
  address: true,
  neighborhood: true,
  price: true,
  bed_bath: true,
  sqft: true,
  unit_type: true,
  availability: true,
  contact_name: true,
  contact_phone: true,
  listing_link: true,
  images: true,
  summary: true,
  amenities: true,
  notes_for_livva: true,
  created_at: true,
  updated_at: true,
} satisfies Prisma.ListingSelect

export async function searchRoomListings(
  filters: SearchFilters = {}
): Promise<SearchResult> {
  try {
    if (isDevelopment) {
      console.log("[DEV] searchRoomListings called with filters:", filters)
    }

    const parsedFilters = searchFiltersSchema.partial().parse(filters ?? {})
    const normalizedFilters = normalizeFilters(parsedFilters)

    if (isDevelopment) {
      console.log("[DEV] Normalized filters:", normalizedFilters)
    }

    const whereClause = buildWhereClause(normalizedFilters)
    const orderClause = buildOrderClause(normalizedFilters.sortBy)

    if (isDevelopment) {
      console.log("[DEV] Prisma query:", {
        where: whereClause,
        orderBy: orderClause,
      })
    }

    const listings = (await prisma.listing.findMany({
      where: whereClause,
      orderBy: orderClause,
      select: listingSelect,
    })) as Listing[]

    if (isDevelopment) {
      console.log("[DEV] Found listings from database:", {
        count: listings.length,
        listings: listings.map((l) => ({
          id: l.id,
          title: l.title,
          address: l.address,
          price: l.price,
          hasImages: Array.isArray(l.images) && l.images.length > 0,
          imageCount: Array.isArray(l.images) ? l.images.length : 0,
          images: l.images,
        })),
      })
    }

    // Apply price filtering only if explicitly provided
    let filteredListings = listings
    if (normalizedFilters.minPrice !== undefined || normalizedFilters.maxPrice !== undefined) {
      filteredListings = listings.filter((listing) =>
        isWithinPriceRange(listing, normalizedFilters)
      )
    }

    // Sort listings
    filteredListings.sort((a, b) => sortListings(a, b, normalizedFilters.sortBy))

    if (isDevelopment) {
      console.log("[DEV] Filtered and sorted listings:", {
        count: filteredListings.length,
        listings: filteredListings.map((l) => ({
          id: l.id,
          title: l.title,
          price: l.price,
          hasImages: Array.isArray(l.images) && l.images.length > 0,
        })),
      })
    }

    return {
      success: true,
      data: filteredListings,
    }
  } catch (error) {
    console.error("Error searching room listings:", error)
    if (isDevelopment) {
      console.error("[DEV] Full error details:", {
        error,
        stack: error instanceof Error ? error.stack : undefined,
        filters,
      })
    }
    return {
      success: false,
      error: "Failed to search room listings. Please try again later.",
    }
  }
}

function normalizeFilters(
  filters: SearchFilters
): NormalizedSearchFilters {
  // Only use provided filters, no defaults
  const normalized: NormalizedSearchFilters = {
    sortBy: filters.sortBy ?? "price-asc",
  }

  // Only set if explicitly provided
  if (filters.minPrice !== undefined) {
    normalized.minPrice = filters.minPrice
  }
  if (filters.maxPrice !== undefined) {
    normalized.maxPrice = filters.maxPrice
  }
  if (filters.city && filters.city.trim().length > 0) {
    normalized.city = filters.city.trim()
  }
  if (filters.keyword && filters.keyword.trim().length > 0) {
    normalized.keyword = filters.keyword.trim()
  }
  if (filters.type && filters.type !== "all") {
    normalized.type = filters.type
  }

  return normalized
}

function buildWhereClause(
  filters: NormalizedSearchFilters
): Prisma.ListingWhereInput {
  const conditions: Prisma.ListingWhereInput[] = []

  // Only add conditions if filters are explicitly provided
  if (filters.city) {
    conditions.push({
      address: { contains: filters.city, mode: "insensitive" },
    })
  }

  if (filters.type && filters.type !== "all") {
    conditions.push({
      unit_type: { equals: UNIT_TYPE_MAP[filters.type], mode: "insensitive" },
    })
  }

  if (filters.keyword) {
    conditions.push({
      OR: [
        { address: { contains: filters.keyword, mode: "insensitive" } },
        { summary: { contains: filters.keyword, mode: "insensitive" } },
        { neighborhood: { contains: filters.keyword, mode: "insensitive" } },
      ],
    })
  }

  // Return empty object if no filters - this will return all listings
  return conditions.length > 0 ? { AND: conditions } : {}
}

function buildOrderClause(
  sortBy: "price-asc" | "price-desc" | "newest"
): Prisma.ListingOrderByWithRelationInput {
  if (sortBy === "newest") {
    return { created_at: "desc" }
  }

  return { price: sortBy === "price-asc" ? "asc" : "desc" }
}

function isWithinPriceRange(
  listing: Listing,
  filters: NormalizedSearchFilters
) {
  const priceValue = parsePrice(listing.price)
  const minPrice = filters.minPrice ?? 0
  const maxPrice = filters.maxPrice ?? Number.MAX_SAFE_INTEGER
  return priceValue >= minPrice && priceValue <= maxPrice
}

function parsePrice(price: Listing["price"]) {
  const value = Number(price)
  if (Number.isFinite(value)) {
    return value
  }
  return 0
}

function sortListings(
  a: Listing,
  b: Listing,
  sortBy: NormalizedSearchFilters["sortBy"]
) {
  if (sortBy === "newest") {
    return (
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  const direction = sortBy === "price-asc" ? 1 : -1
  return (parsePrice(a.price) - parsePrice(b.price)) * direction
}

