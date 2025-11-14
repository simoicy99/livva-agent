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
      id: "z1",
      platform: "Zillow",
      photo:
        "https://imagescdn.homes.com/i2/n2VAyov2Q6YhSg3FfaNhEAGq2E-8iL8TG7C82LLOLYk/117/quincy-san-francisco-ca-6.jpg?p=1",
      price: 4541,
      location: "Quincy (555 Bryant St), SoMa",
      matchScore: 95,
      whyItFits:
        "Within budget, 10 minutes from preferred neighborhood, allows cats",
    },
    {
      id: "r1",
      platform: "Redfin",
      photo:
        "https://imagescdn.homes.com/i2/yPG3CmoZrQsxw8xQypycW7IlhDhfBKw-wQ04YhQycjY/117/nema-san-francisco-ca-15.jpg?p=1",
      price: 4266,
      location: "NEMA (8 10th St), SoMa",
      matchScore: 92,
      whyItFits: "Pet friendly, in-unit laundry, close to public transport",
    },
    {
      id: "a1",
      platform: "Apartments.com",
      photo:
        "https://imagescdn.homes.com/i2/aySY9DJ2TZ7anruxGUN30KfoaDu157BrTdkER30fjUQ/117/astella-san-francisco-ca-6.jpg?t=p&p=1",
      price: 4562,
      location: "Astella (975 Bryant St), SoMa",
      matchScore: 90,
      whyItFits: "Brand new building, amazing gym, 1 block from work",
    },
    {
      id: "z2",
      platform: "Zillow",
      photo:
        "https://imagescdn.homes.com/i2/v9oEJQs8H1XltaMbjeeR9qTxO8je1hLtPLYgtJY20jM/117/pinnacle-at-nob-hill-san-francisco-ca.jpg?p=1",
      price: 3250,
      location: "Pinnacle at Nob Hill (899 Pine St), Nob Hill",
      matchScore: 88,
      whyItFits: "Parking included, modern amenities, walkable neighborhood",
    },
    {
      id: "r2",
      platform: "Redfin",
      photo: "https://source.unsplash.com/500x500/?apartment,interior",
      price: 4929,
      location: "The Fitzgerald (2095 Bryant St), Mission District",
      matchScore: 85,
      whyItFits: "Great neighborhood, pet spa, rooftop terrace",
    },
    {
      id: "a2",
      platform: "Apartments.com",
      photo: "https://source.unsplash.com/500x500/?modern,kitchen",
      price: 3939,
      location: "Spera (39 Tehama St), East Cut",
      matchScore: 82,
      whyItFits: "Floor to ceiling windows, incredible views, 24/7 concierge",
    },
    {
      id: "z3",
      platform: "Zillow",
      photo: "https://source.unsplash.com/500x500/?living,room",
      price: 3172,
      location: "Chorus (30 Otis St), SoMa",
      matchScore: 80,
      whyItFits: "Good price for SoMa, pool and fitness center, allows large dogs",
    },
    {
      id: "r3",
      platform: "Redfin",
      photo: "https://source.unsplash.com/500x500/?apartment,bedroom",
      price: 3775,
      location: "1333 Gough, Cathedral Hill",
      matchScore: 78,
      whyItFits: "Classic building, spacious layout, close to Japantown",
    },
    {
      id: "a3",
      platform: "Apartments.com",
      photo: "https://source.unsplash.com/500x500/?minimalist,interior",
      price: 2814,
      location: "Vara (1600 15th St), Mission District",
      matchScore: 75,
      whyItFits: "Heart of the Mission, great price, close to BART",
    },
    {
      id: "z4",
      platform: "Zillow",
      photo: "https://source.unsplash.com/500x500/?luxury,apartment",
      price: 4000,
      location: "2400 Pacific Ave, Pacific Heights",
      matchScore: 72,
      whyItFits: "Prestigious neighborhood, stunning views, hardwood floors",
    },
  ]
}

