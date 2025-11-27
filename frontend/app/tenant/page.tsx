"use client"

import { useState } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Sparkles, CheckCircle2, Zap, Crown } from "lucide-react"
import { Listing } from "@/lib/type"
import listingsData from "@/lib/data.json"

type FormState = {
  location: string
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
    maxBudget: "",
    moveInDate: "",
    mustHaves: [],
  })
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [sortBy, setSortBy] = useState<"price" | "matchScore">("matchScore")
  const [scanProgress, setScanProgress] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

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
    if (!formData.location) {
      return
    }

    setScanProgress(0)
    setCurrentStepIndex(0)
    setThinkingSteps([])
    setViewState("scanning")
    
    const steps = [
      `Searching listings in ${formData.location}`,
      formData.mustHaves.length > 0
        ? `Filtering for ${formData.mustHaves.join(", ")}`
        : "Filtering candidates",
      "Scoring and ranking candidates",
    ]
    
    const scanInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(scanInterval)
          return 100
        }
        return prev + 2
      })
    }, 40)

    setTimeout(() => {
      clearInterval(scanInterval)
      setScanProgress(1000)
      setViewState("thinking")
      
      let stepIndex = 0
      const stepInterval = setInterval(() => {
        if (stepIndex < steps.length) {
          setCurrentStepIndex(stepIndex)
          setThinkingSteps((prev) => [...prev, steps[stepIndex]])
          stepIndex++
        } else {
          clearInterval(stepInterval)
          setTimeout(() => {
            setListings(listingsData as Listing[])
            setViewState("results")
          }, 1000)
        }
      }, 3600)
    }, 4000)
  }

  const handleListingClick = (listing: Listing) => {
    setSelectedListing(listing)
    setViewState("detail")
  }

  const handleBackToResults = () => {
    setViewState("results")
  }

  if (viewState === "form") {
    const canSubmit = formData.location

    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Find Your Perfect Rental</CardTitle>
            <CardDescription>Tell us what you&apos;re looking for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">
                Where do you want to live? <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="City or neighborhood"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                required
              />
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="maxBudget">
                Maximum Budget <span className="text-destructive">*</span>
              </Label>
              <Input
                id="maxBudget"
                type="number"
                placeholder="$0"
                value={formData.maxBudget}
                onChange={(e) => handleInputChange("maxBudget", e.target.value)}
                required
              />
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="moveInDate">Move-in date (optional)</Label>
              <Input
                id="moveInDate"
                type="date"
                value={formData.moveInDate}
                onChange={(e) => handleInputChange("moveInDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Must-haves (optional)</Label>
              <div className="grid grid-cols-2 gap-2">
                {MUST_HAVES_OPTIONS.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={formData.mustHaves.includes(option)}
                      onCheckedChange={() => handleMustHaveToggle(option)}
                    />
                    <Label
                      htmlFor={option}
                      className="cursor-pointer font-normal text-sm"
                      onClick={() => handleMustHaveToggle(option)}
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full"
            >
              Start Search
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (viewState === "scanning") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-2">
          <CardContent className="py-16 px-8">
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                  <div className="relative rounded-full bg-primary/10 p-4">
                    <Search className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 text-center">
                <h2 className="text-2xl font-semibold">Scanning Multiple Platforms</h2>
                <p className="text-muted-foreground">
                  Searching Zillow, Redfin, and Apartments.com in real-time...
                </p>
              </div>

              <div className="space-y-2">
                <Progress value={scanProgress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Analyzing listings</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                {["Zillow", "Redfin", "Apartments.com"].map((platform, idx) => (
                  <div
                    key={platform}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card/50 transition-all"
                    style={{
                      opacity: scanProgress > (idx + 1) * 30 ? 1 : 0.5,
                      transform: scanProgress > (idx + 1) * 30 ? "scale(1)" : "scale(0.95)",
                    }}
                  >
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-medium">{platform}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (viewState === "thinking") {
    const totalSteps = 3
    const progress = ((thinkingSteps.length / totalSteps) * 100)

    const stepConfigs = [
      {
        text: `Searching listings in ${formData.location}`,
        icon: Search,
      },
      {
        text: formData.mustHaves.length > 0
          ? `Filtering for ${formData.mustHaves.join(", ")}`
          : "Filtering candidates",
        icon: Sparkles,
      },
      {
        text: "Scoring and ranking candidates",
        icon: Zap,
      },
    ]

    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-2">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Spinner className="h-6 w-6 text-primary" />
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              </div>
              <div>
                <CardTitle className="text-xl">AI Agent Working</CardTitle>
                <CardDescription>Analyzing and matching properties for you</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={progress} className="h-2" />

            <div className="space-y-4">
              {stepConfigs.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStepIndex === index && thinkingSteps.length === index
                const isCompleted = thinkingSteps.length > index

                return (
                  <div
                    key={index}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                      isActive
                        ? "bg-primary/5 border-primary/20 shadow-sm"
                        : isCompleted
                        ? "bg-muted/30 border-muted"
                        : "bg-card border-border opacity-50"
                    }`}
                  >
                    <div className="relative mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : isActive ? (
                        <div className="relative">
                          <Icon className="h-5 w-5 text-primary animate-pulse" />
                          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                        </div>
                      ) : (
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p
                        className={`text-sm font-medium transition-colors ${
                          isActive ? "text-foreground" : isCompleted ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.text}
                      </p>
                      {isActive && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Spinner className="h-3 w-3" />
                          <span>Processing...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {thinkingSteps.length === totalSteps && (
              <div className="pt-4 text-center">
                <p className="text-sm text-muted-foreground animate-pulse">
                  Finalizing results...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (viewState === "results") {
    const sortedListings = [...listings].sort((a, b) => {
      if (sortBy === "price") {
        return a.price - b.price
      }
      return b.matchScore - a.matchScore
    })

    return (
      <div className="flex min-h-screen flex-col p-4">
        <div className="mx-auto w-full max-w-4xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Top Matches</h1>
              <p className="text-sm text-muted-foreground">{listings.length} listings found</p>
            </div>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as "price" | "matchScore")}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="matchScore">Match Score</SelectItem>
                <SelectItem value="price">Price</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {sortedListings.map((listing) => (
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

                <Button
                  asChild
                  className="w-full"
                  variant="default"
                >
                  <a
                    href="https://rentlivva.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Join Premium to View Listing on {selectedListing.platform}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}

