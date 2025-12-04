import { config } from "dotenv"
import { join } from "path"
import { Listing, Prisma, PrismaClient } from "@/generated/prisma/client"
import listingsData from "@/lib/data.json"

config({ path: join(process.cwd(), ".env") })

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  try {
    const listings = listingsData as unknown as Listing[]

    console.log(`📦 Found ${listings.length} listings to seed`)

    const listingData = listings.map((listing: Listing) => ({
      id: listing.id,
      title: listing.title,
      address: listing.address,
      neighborhood: listing.neighborhood,
      price: listing.price,
      bed_bath: listing.bed_bath,
      sqft: listing.sqft,
      unit_type: listing.unit_type,
      availability: listing.availability,
      contact_name: listing.contact_name,
      contact_phone: listing.contact_phone,
      listing_link: listing.listing_link,
      images: listing.images,
      summary: listing.summary,
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
    
    const unitTypeCounts = listings.reduce((acc, listing) => {
      acc[listing.unit_type] = (acc[listing.unit_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(unitTypeCounts).forEach(([unitType, count]) => {
      console.log(`   ${unitType}: ${count}`)
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

