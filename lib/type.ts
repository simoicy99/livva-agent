export interface Listing {
  id: string
  platform: "Zillow" | "Redfin" | "Apartments.com"
  photo: string
  price: number
  location: string
  matchScore: number
  whyItFits: string
}

