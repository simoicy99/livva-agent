
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "./generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "dotenv";
config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const dataDir = join(dirname(fileURLToPath(import.meta.url)), "data");
const csvSplitRegex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;

// Configure which CSV files to process
const CSV_FILES = [
  "zillow-room-data.csv",
  "apartments-room-data.csv",
  // Add more CSV files here as needed:
  // "redfin-room-data.csv"
  'roomies.csv',
];

type CsvRow = Record<string, string>;

// Adhering to schema.prisma - all database fields snake_case
interface Listing {
  title: string;  
  address: string;
  neighborhood: string | null;
  price: string;
  bed_bath: string;
  sqft: string | null;
  unit_type: string;
  availability: string;
  contact_name: string | null;
  contact_phone: string | null;
  listing_link: string;
  summary: string | null;
  amenities: string[];
  images: string[];
  notes_for_livva: string | null;
};

const unquote = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/""/g, '"');
  }
  return trimmed;
};

const splitLine = (line: string) => line.split(csvSplitRegex).map(unquote);

const parseCsv = (raw: string) => {
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!lines.length) return [];
  const headers = splitLine(lines[0] ?? "");
  return lines.slice(1).map((line) => {
    const values = splitLine(line);
    return headers.reduce<CsvRow>((acc, header, index) => {
      acc[header] = (values[index] ?? "").trim();
      return acc;
    }, {});
  });
};

const optionalField = (value?: string) => {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "--" || trimmed.toLowerCase() === "no phone listed") {
    return null;
  }
  return trimmed;
};

const parseAmenities = (raw?: string) => {
  const normalized = raw?.trim() ?? "";
  if (!normalized || /no amenities/i.test(normalized)) {
    return [];
  }
  return normalized
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};

const parseImages = (raw?: string) => {
  const normalized = raw?.trim() ?? "";
  if (!normalized || normalized.toLowerCase() === "n/a" || normalized === "--") {
    return [];
  }
  return normalized
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};

// Handle both 'images' (array) and 'image_url' (single URL) columns
const parseImagesFromRow = (row: CsvRow): string[] => {
  // First try 'images' column (comma-separated)
  if (row.images) {
    const parsed = parseImages(row.images);
    if (parsed.length > 0) return parsed;
  }
  // Fall back to 'image_url' column (single URL)
  if (row.image_url) {
    const url = optionalField(row.image_url);
    if (url) return [url];
  }
  return [];
};

const toRequiredString = (value: string, fallback: string) => {
  const trimmed = value?.trim() ?? "";
  return trimmed || fallback;
};

// Map CSV row to Listing with DB field names (snake_case)
const mapCsvRowToListing = (row: CsvRow): Listing => ({
  title: toRequiredString(row.title ?? "", "Untitled listing"),
  address: toRequiredString(row.address ?? "", "Unknown address"),
  neighborhood: optionalField(row.neighborhood),
  price: toRequiredString(row.price ?? "", "Contact for pricing"),
  bed_bath: toRequiredString(row.bed_bath ?? "", "Unknown configuration"),
  sqft: optionalField(row.sqft),
  unit_type: toRequiredString(row.unit_type ?? "", "Room"),
  availability: toRequiredString(row.availability ?? "", "Check availability"),
  contact_name: optionalField(row.contact_name),
  contact_phone: optionalField(row.contact_phone),
  listing_link: toRequiredString(row.listing_link ?? "", "https://example.com"),
  summary: optionalField(row.summary),
  amenities: parseAmenities(row.amenities),
  images: parseImagesFromRow(row),
  notes_for_livva: optionalField(row.notes_for_livva),
});

// Upsert a single listing (update if exists, create if not)
const upsertListing = async (listing: Listing) => {
  const existing = await prisma.listing.findFirst({
    where: { listing_link: listing.listing_link },
  });

  if (existing) {
    await prisma.listing.update({
      where: { id: existing.id },
      data: listing,
    });
    return { action: "updated", id: existing.id };
  } else {
    const created = await prisma.listing.create({ data: listing });
    return { action: "created", id: created.id };
  }
};

// Process a single CSV file and upsert all listings
const processCsvFile = async (fileName: string) => {
  const csvFilePath = join(dataDir, fileName);
  
  try {
    const fileContents = await readFile(csvFilePath, "utf8");
    const rows = parseCsv(fileContents);
    
    if (!rows.length) {
      console.warn(`⚠️  No rows found in ${fileName}, skipping.`);
      return { processed: 0, created: 0, updated: 0 };
    }

    const listings = rows.map(mapCsvRowToListing);
    let created = 0;
    let updated = 0;

    // Process listings sequentially to avoid overwhelming the database
    for (const listing of listings) {
      // Skip listings with invalid listing_link
      if (!listing.listing_link || listing.listing_link === "https://example.com") {
        console.warn(`⚠️  Skipping listing with invalid link: ${listing.title}`);
        continue;
      }

      const result = await upsertListing(listing);
      if (result.action === "created") {
        created++;
      } else {
        updated++;
      }
    }

    console.log(`✅ Processed ${fileName}: ${created} created, ${updated} updated (${listings.length} total rows)`);
    return { processed: listings.length, created, updated };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.warn(`⚠️  File not found: ${fileName}, skipping.`);
      return { processed: 0, created: 0, updated: 0 };
    }
    throw error;
  }
};

// Process all configured CSV files
const seedListings = async () => {
  console.log(`\n📊 Processing ${CSV_FILES.length} CSV file(s)...\n`);
  
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalProcessed = 0;

  for (const fileName of CSV_FILES) {
    const result = await processCsvFile(fileName);
    totalCreated += result.created;
    totalUpdated += result.updated;
    totalProcessed += result.processed;
  }

  console.log(`\n📈 Summary: ${totalCreated} created, ${totalUpdated} updated (${totalProcessed} total rows processed)\n`);
};

const displayListings = async () => {
  const listings = await prisma.listing.findMany({
    orderBy: { created_at: "desc" },
  });

  console.log("\n" + "=".repeat(80));
  console.log(`DATABASE LISTINGS (Total: ${listings.length})`);
  console.log("=".repeat(80) + "\n");

  if (listings.length === 0) {
    console.log("No listings found in database.");
    return;
  }

  listings.forEach((listing: any, index: number) => {
    // All database fields are snake_case:
    console.log(`${index + 1}. ${listing.title}`);
    console.log(`   Address: ${listing.address}`);
    console.log(`   Neighborhood: ${listing.neighborhood || "N/A"}`);
    console.log(`   Price: ${listing.price}`);
    console.log(`   Bed/Bath: ${listing.bed_bath}`);
    console.log(`   Sqft: ${listing.sqft || "N/A"}`);
    console.log(`   Unit Type: ${listing.unit_type}`);
    console.log(`   Availability: ${listing.availability}`);
    if (listing.contact_name) {
      console.log(`   Contact: ${listing.contact_name}${listing.contact_phone ? ` - ${listing.contact_phone}` : ""}`);
    }
    console.log(`   Link: ${listing.listing_link}`);
    if (listing.amenities.length > 0) {
      console.log(`   Amenities: ${listing.amenities.join(", ")}`);
    }
    if (listing.summary) {
      const summaryPreview = listing.summary.length > 100 
        ? listing.summary.substring(0, 100) + "..." 
        : listing.summary;
      console.log(`   Summary: ${summaryPreview}`);
    }
    console.log("");
  });
};

const main = async () => {
  try {
    await seedListings();
    await displayListings();
  } catch (error) {
    console.error("❌ Processing failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});

