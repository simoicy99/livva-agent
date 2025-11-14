import { Suspense } from "react"
import { searchRoomListings, type SearchFilters } from "@/app/actions/room-listings"
import { SearchForm } from "@/components/search-form"
import { RoomListings } from "@/components/room-listings"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

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
    <div className="flex min-h-screen flex-col">
      <main className="flex min-h-screen w-full flex-col items-center py-8 px-4 sm:px-8">
        <div className="w-full max-w-6xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-semibold tracking-tight">
              Property Listings
            </h1>
            <p className="text-sm text-muted-foreground">
              Search and discover available properties
            </p>
          </div>

          <Suspense
            fallback={
              <div className="mb-8 space-y-4">
                <Skeleton className="h-64 w-full" />
              </div>
            }
          >
            <SearchForm />
          </Suspense>

          {!result.success && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>
          )}

          {result.success && result.data && result.data.length > 0 && (
            <>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Found {result.data.length} listing{result.data.length !== 1 ? "s" : ""}
                </p>
              </div>
              <RoomListings listings={result.data} />
            </>
          )}

          {result.success && result.data && result.data.length === 0 && (
            <div className="rounded-lg border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                No listings found. Please try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}