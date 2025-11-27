
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
const csvFileName = "apartments.com-room-data.csv";
const csvFilePath = join(dirname(fileURLToPath(import.meta.url)), "data", csvFileName);
const csvSplitRegex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;

type CsvRow = Record<string, string>;


// double check with schema.prisma
interface Listing {
  title: string;  
  address: string;
  neighborhood: string;
  price: string;
  bedBath: string;
  sqft: string;
  unitType: string;
  availability: string;
  contactName: string;
  contactPhone: string;
  listingLink: string;
  summary: string;
  amenities: string[];
  images: string[];
  livvaNotes: string;
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

const mapCsvRowToListing = (row: CsvRow) => ({
  title: toRequiredString(row.title ?? "", "Untitled listing"),
  address: toRequiredString(row.address ?? "", "Unknown address"),
  neighborhood: optionalField(row.neighborhood),
  price: toRequiredString(row.price ?? "", "Contact for pricing"),
  bedBath: toRequiredString(row.bed_bath ?? "", "Unknown configuration"),
  sqft: optionalField(row.sqft),
  unitType: toRequiredString(row.unit_type ?? "", "Room"),
  availability: toRequiredString(row.availability ?? "", "Check availability"),
  contactName: optionalField(row.contact_name),
  contactPhone: optionalField(row.contact_phone),
  listingLink: toRequiredString(row.listing_link ?? "", "https://example.com"),
  summary: optionalField(row.summary),
  amenities: parseAmenities(row.amenities),
  images: [],
  livvaNotes: optionalField(row.notes_for_livva),
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
  await Promise.all(listings.map((listing) => prisma.listing.create({ data: listing })));
  console.log(`Seeded ${listings.length} listing(s) from ${csvFileName}.`);
};

const displayListings = async () => {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
  });

  console.log("\n" + "=".repeat(80));
  console.log(`DATABASE LISTINGS (Total: ${listings.length})`);
  console.log("=".repeat(80) + "\n");

  if (listings.length === 0) {
    console.log("No listings found in database.");
    return;
  }

  listings.forEach((listing: any, index: number) => {
    console.log(`${index + 1}. ${listing.title}`);
    console.log(`   Address: ${listing.address}`);
    console.log(`   Neighborhood: ${listing.neighborhood || "N/A"}`);
    console.log(`   Price: ${listing.price}`);
    console.log(`   Bed/Bath: ${listing.bedBath}`);
    console.log(`   Sqft: ${listing.sqft || "N/A"}`);
    console.log(`   Unit Type: ${listing.unitType}`);
    console.log(`   Availability: ${listing.availability}`);
    if (listing.contactName) {
      console.log(`   Contact: ${listing.contactName}${listing.contactPhone ? ` - ${listing.contactPhone}` : ""}`);
    }
    console.log(`   Link: ${listing.listingLink}`);
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
