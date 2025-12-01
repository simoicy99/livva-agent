
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
const csvFileName = "apartments-room-data.csv";
const csvFilePath = join(dirname(fileURLToPath(import.meta.url)), "data", csvFileName);
const csvSplitRegex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;

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
  images: [],
  notes_for_livva: optionalField(row.notes_for_livva),
});

const seedListings = async () => {
  const fileContents = await readFile(csvFilePath, "utf8");
  const rows = parseCsv(fileContents);
  if (!rows.length) {
    console.warn("No rows found in CSV, nothing to seed.");
    return;
  }

  const listings = rows.map(mapCsvRowToListing);

  await prisma.listing.deleteMany();
  await Promise.all(listings.map((listing) => 
    prisma.listing.create({ data: listing })
  ));
  console.log(`Seeded ${listings.length} listing(s) from ${csvFileName}.`);
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
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});

