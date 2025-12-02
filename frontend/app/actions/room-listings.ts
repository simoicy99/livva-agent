"use server"

import { Listing, Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

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
  minPrice: number
  maxPrice: number
  city: string
  keyword: string
  type: NonNullable<SearchFilters["type"]>
  sortBy: NonNullable<SearchFilters["sortBy"]>
}

const DEFAULT_FILTERS: NormalizedSearchFilters = {
  minPrice: 0,
  maxPrice: 5000,
  city: "San Francisco",
  keyword: "",
  type: "all",
  sortBy: "price-asc",
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
    const parsedFilters = searchFiltersSchema.partial().parse(filters ?? {})
    const normalizedFilters = normalizeFilters(parsedFilters)

    const listings = (await prisma.listing.findMany({
      where: buildWhereClause(normalizedFilters),
      orderBy: buildOrderClause(normalizedFilters.sortBy),
      select: listingSelect,
      take: 50,
    })) as Listing[]

    const filteredListings = listings
      .filter((listing) => isWithinPriceRange(listing, normalizedFilters))
      .sort((a, b) => sortListings(a, b, normalizedFilters.sortBy))
      .slice(0, 10)

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

function normalizeFilters(
  filters: SearchFilters
): NormalizedSearchFilters {
  const minPrice = filters.minPrice ?? DEFAULT_FILTERS.minPrice
  const maxPrice = filters.maxPrice ?? DEFAULT_FILTERS.maxPrice

  if (minPrice > maxPrice) {
    return {
      ...DEFAULT_FILTERS,
      ...filters,
      minPrice: maxPrice,
      maxPrice: minPrice,
      city: formatString(filters.city, DEFAULT_FILTERS.city),
      keyword: formatString(filters.keyword, DEFAULT_FILTERS.keyword),
      type: filters.type ?? DEFAULT_FILTERS.type,
      sortBy: filters.sortBy ?? DEFAULT_FILTERS.sortBy,
    }
  }

  return {
    minPrice,
    maxPrice,
    city: formatString(filters.city, DEFAULT_FILTERS.city),
    keyword: formatString(filters.keyword, DEFAULT_FILTERS.keyword),
    type: filters.type ?? DEFAULT_FILTERS.type,
    sortBy: filters.sortBy ?? DEFAULT_FILTERS.sortBy,
  }
}

function formatString(value: string | undefined, fallback: string) {
  if (!value) {
    return fallback
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

function buildWhereClause(
  filters: NormalizedSearchFilters
): Prisma.ListingWhereInput {
  const conditions: Prisma.ListingWhereInput[] = []

  if (filters.city) {
    conditions.push({
      address: { contains: filters.city, mode: "insensitive" },
    })
  }

  if (filters.type !== "all") {
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

  return conditions.length > 0 ? { AND: conditions } : {}
}

function buildOrderClause(
  sortBy: NormalizedSearchFilters["sortBy"]
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
  return priceValue >= filters.minPrice && priceValue <= filters.maxPrice
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

