import { Suspense } from "react"
import { searchRoomListings, type SearchFilters } from "./actions/room-listings"
import { SearchForm } from "./components/search-form"
import { RoomListings } from "./components/room-listings"

interface HomeProps {
  searchParams: Promise<{
    keyword?: string
    minPrice?: string
    maxPrice?: string
    city?: string
    type?: string
    sortBy?: string
  }>
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams

  const filters: SearchFilters = {
    keyword: params.keyword,
    minPrice: params.minPrice ? Number.parseInt(params.minPrice, 10) : undefined,
    maxPrice: params.maxPrice ? Number.parseInt(params.maxPrice, 10) : undefined,
    city: params.city,
    type: (params.type as SearchFilters["type"]) || "all",
    sortBy: (params.sortBy as SearchFilters["sortBy"]) || "price-asc",
  }

  const result = await searchRoomListings(filters)

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full flex-col items-center py-8 px-4 sm:px-8">
        <div className="w-full max-w-6xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
              Room Listings Search
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Find your perfect rental in San Francisco using BrightData-powered search
            </p>
          </div>

          <Suspense fallback={<div className="mb-8 h-64 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />}>
            <SearchForm />
          </Suspense>

          {!result.success && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              <p className="font-medium">Error</p>
              <p className="text-sm">{result.error}</p>
            </div>
          )}

          {result.success && result.data && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Found {result.data.length} listing{result.data.length !== 1 ? "s" : ""}
                </p>
              </div>
              <RoomListings listings={result.data} />
            </>
          )}

          {result.success && result.data && result.data.length === 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-zinc-600 dark:text-zinc-400">
                No room listings found. Please try adjusting your search criteria.
              </p>
            </div>
          )}

          <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Note:</strong> These listings were retrieved using BrightData MCP server
              from Zillow. Rental availability and prices can change rapidly, so contact
              property managers or landlords directly for the most current information.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}