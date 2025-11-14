import { config } from "dotenv"
import { join } from "path"
import { PrismaClient, Prisma } from "@/app/generated/prisma/client"
import type { Listing } from "@/lib/type"
import listingsData from "@/lib/data.json"

config({ path: join(process.cwd(), ".env") })

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  try {
    const listings = listingsData as Listing[]

    console.log(`📦 Found ${listings.length} listings to seed`)

    const listingData = listings.map((listing) => ({
      id: listing.id,
      platform: listing.platform,
      photo: listing.photo,
      price: listing.price,
      location: listing.location,
      match_score: listing.matchScore,
      why_it_fits: listing.whyItFits,
      metadata: Prisma.JsonNull,
    }))

    console.log("🔄 Clearing existing listings...")
    try {
      await prisma.listing.deleteMany({})
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2021") {
        console.error("❌ Database tables don't exist yet.")
        console.error("   Please run migrations first: pnpm prisma migrate dev")
        throw new Error("Database tables not found. Please run migrations first.")
      }
      throw error
    }

    console.log("💾 Inserting listings into database...")
    
    const result = await prisma.listing.createMany({
      data: listingData,
      skipDuplicates: true,
    })

    console.log(`✅ Successfully seeded ${result.count} listings`)
    console.log(`📊 Platform breakdown:`)
    
    const platformCounts = listings.reduce((acc, listing) => {
      acc[listing.platform] = (acc[listing.platform] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(platformCounts).forEach(([platform, count]) => {
      console.log(`   ${platform}: ${count}`)
    })
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

