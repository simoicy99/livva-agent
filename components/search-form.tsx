"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { Search, X } from "lucide-react"

export function SearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "1500",
    city: searchParams.get("city") || "San Francisco",
    type: searchParams.get("type") || "all",
    sortBy: searchParams.get("sortBy") || "price-asc",
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(() => {
      const params = new URLSearchParams()
      
      if (filters.keyword) params.set("keyword", filters.keyword)
      if (filters.minPrice) params.set("minPrice", filters.minPrice)
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice)
      if (filters.city) params.set("city", filters.city)
      if (filters.type && filters.type !== "all") params.set("type", filters.type)
      if (filters.sortBy && filters.sortBy !== "price-asc") params.set("sortBy", filters.sortBy)

      router.push(`/?${params.toString()}`)
    })
  }

  function handleReset() {
    setFilters({
      keyword: "",
      minPrice: "",
      maxPrice: "1500",
      city: "San Francisco",
      type: "all",
      sortBy: "price-asc",
    })
    startTransition(() => {
      router.push("/")
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Keyword Search */}
        <div className="mb-4">
          <label
            htmlFor="keyword"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              id="keyword"
              value={filters.keyword}
              onChange={(e) =>
                setFilters({ ...filters, keyword: e.target.value })
              }
              placeholder="Search by title, description, or address..."
              className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Price Range */}
          <div>
            <label
              htmlFor="minPrice"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Min Price ($)
            </label>
            <input
              type="number"
              id="minPrice"
              value={filters.minPrice}
              onChange={(e) =>
                setFilters({ ...filters, minPrice: e.target.value })
              }
              placeholder="0"
              min="0"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <div>
            <label
              htmlFor="maxPrice"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Max Price ($)
            </label>
            <input
              type="number"
              id="maxPrice"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters({ ...filters, maxPrice: e.target.value })
              }
              placeholder="5000"
              min="0"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          {/* City */}
          <div>
            <label
              htmlFor="city"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              value={filters.city}
              onChange={(e) =>
                setFilters({ ...filters, city: e.target.value })
              }
              placeholder="San Francisco"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          {/* Type */}
          <div>
            <label
              htmlFor="type"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Type
            </label>
            <select
              id="type"
              value={filters.type}
              onChange={(e) =>
                setFilters({ ...filters, type: e.target.value })
              }
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="all">All Types</option>
              <option value="studio">Studio</option>
              <option value="room">Room</option>
              <option value="apartment">Apartment</option>
            </select>
          </div>
        </div>

        {/* Sort By */}
        <div className="mt-4">
          <label
            htmlFor="sortBy"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Sort By
          </label>
          <select
            id="sortBy"
            value={filters.sortBy}
            onChange={(e) =>
              setFilters({ ...filters, sortBy: e.target.value })
            }
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Searching..." : "Search"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <X className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
    </form>
  )
}

