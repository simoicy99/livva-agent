export type Listing = {
  id: string
  platform: "Zillow" | "Redfin" | "Apartments.com"
  photo: string
  price: number
  location: string
  matchScore: number
  whyItFits: string
}

export const generateMockListings = (): Listing[] => {
  return [
    {
      id: "1",
      platform: "Zillow",
      photo: "https://placekeanu.com/500",
      price: 2900,
      location: "Mission District",
      matchScore: 95,
      whyItFits: "Within budget, 10 minutes from preferred neighborhood, allows cats",
    },
    {
      id: "2",
      platform: "Redfin",
      photo: "https://placekeanu.com/500",
      price: 2800,
      location: "Castro",
      matchScore: 92,
      whyItFits: "Pet friendly, in-unit laundry, close to public transport",
    },
    {
      id: "3",
      platform: "Apartments.com",
      photo: "https://placekeanu.com/500",
      price: 3000,
      location: "Hayes Valley",
      matchScore: 88,
      whyItFits: "Parking included, modern amenities, walkable neighborhood",
    },
  ]
}

