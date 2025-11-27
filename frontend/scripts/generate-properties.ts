import { config } from "dotenv"
import { faker } from "@faker-js/faker"
import { writeFileSync } from "fs"
import { join } from "path"
import type { Listing } from "../lib/type"

config({ path: join(process.cwd(), ".env") })


interface PexelsPhoto {
  id: number
  width: number
  height: number
  url: string
  photographer: string
  photographer_url: string
  src: {
    original: string
    large2x: string
    large: string
    medium: string
    small: string
    portrait: string
    landscape: string
    tiny: string
  }
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[]
  page: number
  per_page: number
  total_results: number
  next_page?: string
}

const PLATFORMS: Listing["platform"][] = ["Zillow", "Redfin", "Apartments.com"]

const SAN_FRANCISCO_NEIGHBORHOODS = [
  "SoMa",
  "Mission District",
  "Nob Hill",
  "Hayes Valley",
  "Pacific Heights",
  "Castro",
  "East Cut",
  "Cathedral Hill",
  "Financial District",
  "North Beach",
  "Russian Hill",
  "Marina",
  "Potrero Hill",
  "Mission Bay",
  "Tenderloin",
] as const

const WHY_IT_FITS_OPTIONS = [
  "Within budget, 10 minutes from preferred neighborhood, allows cats",
  "Pet friendly, in-unit laundry, close to public transport",
  "Brand new building, amazing gym, 1 block from work",
  "Parking included, modern amenities, walkable neighborhood",
  "Great neighborhood, pet spa, rooftop terrace",
  "Floor to ceiling windows, incredible views, 24/7 concierge",
  "Good price for SoMa, pool and fitness center, allows large dogs",
  "Classic building, spacious layout, close to Japantown",
  "Heart of the Mission, great price, close to BART",
  "Prestigious neighborhood, stunning views, hardwood floors",
  "Modern kitchen, high ceilings, natural light",
  "Rooftop deck, bike storage, pet-friendly",
  "Close to restaurants and nightlife, updated appliances",
  "Quiet street, private balcony, in-unit washer/dryer",
  "Historic building, character details, great location",
  "New construction, smart home features, concierge service",
  "Affordable for the area, good transit access, safe neighborhood",
  "Luxury amenities, fitness center, coworking space",
] as const

const SEARCH_QUERIES = [
  "interior design",
  "interior architecture",
  "living room",
  "apartment",
] as const

const PHOTOS_PER_PAGE = 80
const CACHE_THRESHOLD = 20

let photoCache: string[] = []
let currentQueryIndex = 0
let currentPage = 1

const fetchPexelsPhotosBatch = async (apiKey: string, count: number = PHOTOS_PER_PAGE): Promise<string[]> => {
  try {
    const query = SEARCH_QUERIES[currentQueryIndex % SEARCH_QUERIES.length]
    const perPage = Math.min(count, PHOTOS_PER_PAGE)

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${currentPage}&per_page=${perPage}`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`)
    }

    const data: PexelsSearchResponse = await response.json()

    if (data.photos && data.photos.length > 0) {
      const photos = data.photos.map((photo) => photo.src.large)
      
      currentPage++
      if (data.photos.length < perPage || !data.next_page) {
        currentQueryIndex++
        currentPage = 1
      }
      
      return photos
    }

    throw new Error("No photos found in Pexels response")
  } catch (error) {
    console.warn(`Failed to fetch Pexels photos: ${error instanceof Error ? error.message : "Unknown error"}`)
    return []
  }
}

const getPhotoFromCache = async (apiKey: string): Promise<string> => {
  if (photoCache.length < CACHE_THRESHOLD) {
    console.log(`Fetching new batch of photos (cache: ${photoCache.length} remaining)...`)
    const newPhotos = await fetchPexelsPhotosBatch(apiKey, PHOTOS_PER_PAGE)
    photoCache.push(...newPhotos)
    
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  if (photoCache.length === 0) {
    return `https://placekeanu.com/${faker.number.int({ min: 400, max: 600 })}`
  }

  const photo = photoCache.shift()!
  return photo
}

const generateListing = async (index: number, apiKey: string): Promise<Listing> => {
  const platform = faker.helpers.arrayElement(PLATFORMS)
  const neighborhood = faker.helpers.arrayElement(SAN_FRANCISCO_NEIGHBORHOODS)
  const streetNumber = faker.location.buildingNumber()
  const streetName = faker.location.street()
  const buildingName = faker.helpers.maybe(() => faker.company.name(), { probability: 0.4 })
  
  const location = buildingName
    ? `${buildingName} (${streetNumber} ${streetName}), ${neighborhood}`
    : `${streetNumber} ${streetName}, ${neighborhood}`

  const price = faker.number.int({ min: 2500, max: 5500 })
  const matchScore = faker.number.int({ min: 70, max: 98 })
  const whyItFits = faker.helpers.arrayElement(WHY_IT_FITS_OPTIONS)

  const platformPrefix = platform === "Zillow" ? "z" : platform === "Redfin" ? "r" : "a"
  const id = `${platformPrefix}${index + 1}`

  const photo = await getPhotoFromCache(apiKey)

  return {
    id,
    platform,
    photo,
    price,
    location,
    matchScore,
    whyItFits,
  }
}

const generateProperties = async (count: number = 50, apiKey: string): Promise<Listing[]> => {
  faker.seed(42)
  photoCache = []
  currentQueryIndex = 0
  currentPage = 1
  
  const listings: Listing[] = []
  
  console.log(`Pre-fetching initial batch of photos...`)
  const initialPhotos = await fetchPexelsPhotosBatch(apiKey, PHOTOS_PER_PAGE)
  photoCache.push(...initialPhotos)
  console.log(`Cached ${photoCache.length} photos`)
  
  for (let i = 0; i < count; i++) {
    const listing = await generateListing(i, apiKey)
    listings.push(listing)
    
    if ((i + 1) % 10 === 0) {
      console.log(`Generated ${i + 1}/${count} listings... (cache: ${photoCache.length} photos remaining)`)
    }
  }
  
  return listings
}

const main = async () => {
  const apiKey = process.env.PEXELS_API_KEY

  if (!apiKey) {
    console.error("❌ PEXELS_API_KEY environment variable is not set")
    console.error("   Please set it before running the script:")
    console.error("   export PEXELS_API_KEY=your_api_key")
    console.error("   or")
    console.error("   PEXELS_API_KEY=your_api_key pnpm generate:properties")
    process.exit(1)
  }

  const count = process.argv[2] ? Number.parseInt(process.argv[2], 10) : 50
  
  if (Number.isNaN(count) || count < 1) {
    console.error("Please provide a valid number of properties to generate")
    process.exit(1)
  }

  console.log(`Generating ${count} properties using Pexels API...`)
  const listings = await generateProperties(count, apiKey)
  
  const outputPath = join(process.cwd(), "lib", "data.json")
  writeFileSync(outputPath, JSON.stringify(listings, null, 2), "utf-8")
  
  console.log(`✅ Generated ${listings.length} properties and saved to ${outputPath}`)
  console.log(`   Platforms: ${listings.filter(l => l.platform === "Zillow").length} Zillow, ${listings.filter(l => l.platform === "Redfin").length} Redfin, ${listings.filter(l => l.platform === "Apartments.com").length} Apartments.com`)
}

main().catch((error) => {
  console.error("Error generating properties:", error)
  process.exit(1)
})

