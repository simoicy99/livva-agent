"use client"

import { useState } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Listing } from "@/lib/type"
import listingsData from "@/lib/data.json"

type FormState = {
  location: string
  minBudget: string
  maxBudget: string
  moveInDate: string
  mustHaves: string[]
}

type ViewState = "form" | "scanning" | "thinking" | "results" | "detail"

const MUST_HAVES_OPTIONS = [
  "In-unit laundry",
  "Parking",
  "Pet friendly",
  "Dishwasher",
  "Air conditioning",
  "Balcony",
] as const

export default function TenantPage() {
  const [viewState, setViewState] = useState<ViewState>("form")
  const [formData, setFormData] = useState<FormState>({
    location: "",
    minBudget: "",
    maxBudget: "",
    moveInDate: "",
    mustHaves: [],
  })
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([])
  const [listings, setListings] = useState<Listing[]>([])

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMustHaveToggle = (option: string) => {
    setFormData((prev) => {
      const newMustHaves = prev.mustHaves.includes(option)
        ? prev.mustHaves.filter((item) => item !== option)
        : [...prev.mustHaves, option]
      return { ...prev, mustHaves: newMustHaves }
    })
  }

  const handleSubmit = () => {
    setViewState("scanning")
    
    setTimeout(() => {
      setViewState("thinking")
      const steps = [
        `Searching listings in ${formData.location || "San Francisco"} under $${formData.maxBudget || "3,000"}`,
        formData.mustHaves.length > 0
          ? `Filtering for ${formData.mustHaves.join(", ")}`
          : "Filtering candidates",
        "Scoring 87 candidates",
      ]
      
      let currentStep = 0
      const stepInterval = setInterval(() => {
        if (currentStep < steps.length) {
          setThinkingSteps((prev) => [...prev, steps[currentStep]])
          currentStep++
        } else {
          clearInterval(stepInterval)
          setTimeout(() => {
            setListings(listingsData as Listing[])
            setViewState("results")
          }, 500)
        }
      }, 1500)
    }, 2000)
  }

  const handleListingClick = (listing: Listing) => {
    setSelectedListing(listing)
    setViewState("detail")
  }

  const handleBackToResults = () => {
    setViewState("results")
  }

  if (viewState === "form") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Find Your Perfect Rental</CardTitle>
            <CardDescription>Answer a few questions to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="location">Where do you want to live?</Label>
              <Input
                id="location"
                type="text"
                placeholder="City or neighborhood"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                aria-label="Location"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minBudget">Min Budget</Label>
                <Input
                  id="minBudget"
                  type="number"
                  placeholder="$0"
                  value={formData.minBudget}
                  onChange={(e) => handleInputChange("minBudget", e.target.value)}
                  aria-label="Minimum budget"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxBudget">Max Budget</Label>
                <Input
                  id="maxBudget"
                  type="number"
                  placeholder="$0"
                  value={formData.maxBudget}
                  onChange={(e) => handleInputChange("maxBudget", e.target.value)}
                  aria-label="Maximum budget"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="moveInDate">Move-in date?</Label>
              <Input
                id="moveInDate"
                type="date"
                value={formData.moveInDate}
                onChange={(e) => handleInputChange("moveInDate", e.target.value)}
                aria-label="Move-in date"
              />
            </div>

            <div className="space-y-3">
              <Label>Must-haves</Label>
              <div className="grid grid-cols-2 gap-3">
                {MUST_HAVES_OPTIONS.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={formData.mustHaves.includes(option)}
                      onCheckedChange={() => handleMustHaveToggle(option)}
                      aria-label={option}
                    />
                    <Label
                      htmlFor={option}
                      className="cursor-pointer font-normal"
                      onClick={() => handleMustHaveToggle(option)}
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={handleSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              className="cursor-pointer rounded-md border px-4 py-2 text-center transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Start search"
            >
              Start Search
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (viewState === "scanning") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-12 text-center">
            <p className="text-lg">Got it. I am scanning Zillow, Redfin, and Apartments.com for you in the background.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (viewState === "thinking") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Searching...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {thinkingSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <p className="text-sm">{step}</p>
              </div>
            ))}
            {thinkingSteps.length < 3 && (
              <div className="flex items-center gap-2 opacity-50">
                <div className="h-2 w-2 rounded-full bg-muted" />
                <p className="text-sm">Processing...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (viewState === "results") {
    return (
      <div className="flex min-h-screen flex-col p-4">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">Top Matches</h1>
            <p className="text-sm text-muted-foreground">{listings.length} listings found</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {listings.map((listing) => (
              <Card
                key={listing.id}
                role="button"
                tabIndex={0}
                onClick={() => handleListingClick(listing)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleListingClick(listing)
                  }
                }}
                className="cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`View ${listing.platform} listing in ${listing.location}`}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
                    <Image
                      src={listing.photo}
                      alt={`${listing.location} rental`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute right-2 top-2 rounded bg-background/90 px-2 py-1 text-xs font-medium">
                      {listing.platform}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">${listing.price.toLocaleString()}/mo</p>
                        <p className="text-sm text-muted-foreground">{listing.location}</p>
                      </div>
                      <div className="rounded bg-primary/10 px-2 py-1 text-xs font-medium">
                        {listing.matchScore}% match
                      </div>
                    </div>
                    <p className="text-sm">{listing.whyItFits}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (viewState === "detail" && selectedListing) {
    return (
      <div className="flex min-h-screen flex-col p-4">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <div
            role="button"
            tabIndex={0}
            onClick={handleBackToResults}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleBackToResults()
              }
            }}
            className="cursor-pointer text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1 w-fit"
            aria-label="Back to results"
          >
            ← Back to results
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
                <Image
                  src={selectedListing.photo}
                  alt={`${selectedListing.location} rental`}
                  fill
                  className="object-cover"
                />
                <div className="absolute right-2 top-2 rounded bg-background/90 px-2 py-1 text-xs font-medium">
                  {selectedListing.platform}
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl font-semibold">${selectedListing.price.toLocaleString()}/mo</p>
                    <p className="text-muted-foreground">{selectedListing.location}</p>
                  </div>
                  <div className="rounded bg-primary/10 px-3 py-1 text-sm font-medium">
                    {selectedListing.matchScore}% match
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <p className="text-sm font-medium mb-2">Why this fits you:</p>
                  <p className="text-sm">
                    This is ranked #1 because it is ${selectedListing.price.toLocaleString()} which is within your budget, 
                    10 minutes from your preferred neighborhood, and allows cats.
                  </p>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => window.open(`https://${selectedListing.platform.toLowerCase().replace(".com", "")}.com`, "_blank")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      window.open(`https://${selectedListing.platform.toLowerCase().replace(".com", "")}.com`, "_blank")
                    }
                  }}
                  className="cursor-pointer rounded-md border px-4 py-2 text-center transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`View listing on ${selectedListing.platform}`}
                >
                  View on {selectedListing.platform}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}

