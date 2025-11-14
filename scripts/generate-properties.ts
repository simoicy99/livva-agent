import { faker } from "@faker-js/faker"
import { writeFileSync } from "fs"
import { join } from "path"
import type { Listing } from "../lib/type"

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

const generateListing = (index: number): Listing => {
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

  const photo = `https://placekeanu.com/${faker.number.int({ min: 400, max: 600 })}`

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

const generateProperties = (count: number = 50): Listing[] => {
  faker.seed(42)
  return Array.from({ length: count }, (_, index) => generateListing(index))
}

const main = () => {
  const count = process.argv[2] ? Number.parseInt(process.argv[2], 10) : 50
  
  if (Number.isNaN(count) || count < 1) {
    console.error("Please provide a valid number of properties to generate")
    process.exit(1)
  }

  console.log(`Generating ${count} properties...`)
  const listings = generateProperties(count)
  
  const outputPath = join(process.cwd(), "lib", "data.json")
  writeFileSync(outputPath, JSON.stringify(listings, null, 2), "utf-8")
  
  console.log(`✅ Generated ${listings.length} properties and saved to ${outputPath}`)
  console.log(`   Platforms: ${listings.filter(l => l.platform === "Zillow").length} Zillow, ${listings.filter(l => l.platform === "Redfin").length} Redfin, ${listings.filter(l => l.platform === "Apartments.com").length} Apartments.com`)
}

main()

