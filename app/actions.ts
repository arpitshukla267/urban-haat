"use server";

import { MongoClient } from "mongodb";
import { randomBytes } from "crypto";

const INTERESTS = [
 " THE FUN FACTORY",
 " URBAN FOOD COURT",
 " HANDCRAFT MEET",
 " JHANSI HERITAGE",
 " GO KARTING",
 " URBAN PUNJAB",
];

/* ---- MongoDB connection (reused between requests) ---- */
const g = globalThis as unknown as { _mongo?: Promise<MongoClient>; _indexed?: boolean };

async function tickets() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in .env.local");
  if (!g._mongo) {
    g._mongo = new MongoClient(uri).connect();
    // If connecting fails, forget it so the next try connects again (and picks up fixed credentials).
    g._mongo.catch(() => {
      g._mongo = undefined;
      g._indexed = false;
    });
  }
  const col = (await g._mongo).db(process.env.MONGODB_DB ?? "urbanhaat").collection("tickets");
  if (!g._indexed) {
    await col.createIndex({ ticketId: 1 }, { unique: true });
    g._indexed = true;
  }
  return col;
}

/* ---- Save the form + generate a ticket ---- */
export async function createTicket(input: {
  name: string;
  phone: string;
  interest: string;
  description: string;
}): Promise<
  | { ok: true; id: string; name: string; interest: string }
  | { ok: false; error: string }
> {
  const name = String(input?.name ?? "").trim();
  const phone = String(input?.phone ?? "").replace(/\D/g, "");
  const interest = String(input?.interest ?? "");
  const description = String(input?.description ?? "").trim().slice(0, 300);

  if (name.length < 2 || name.length > 60) return { ok: false, error: "Please enter your full name." };
  if (phone.length < 10 || phone.length > 13) return { ok: false, error: "Please enter a valid phone number." };
  if (!INTERESTS.includes(interest)) return { ok: false, error: "Please choose a field of interest." };

  try {
    const ticketId = `UH-${randomBytes(6).toString("hex").toUpperCase()}`;
    const col = await tickets();
    await col.insertOne({ ticketId, name, phone, interest, description, createdAt: new Date() });
    return { ok: true, id: ticketId, name, interest };
  } catch (err) {
    console.error("createTicket failed:", err);
    return {
      ok: false,
      error:
        process.env.NODE_ENV === "development"
          ? `Database error: ${(err as Error).message}`
          : "We couldn't save your booking. Please try again.",
    };
  }
}

/* ---- Check a scanned ticket: it is genuine only if it exists in the database ---- */
export async function verifyTicket(id: string): Promise<
  | { valid: true; id: string; name: string; interest: string; phoneLast4: string; issuedAt: number }
  | { valid: false }
> {
  const ticketId = String(id ?? "").toUpperCase();
  if (!/^UH-[0-9A-F]{12}$/.test(ticketId)) return { valid: false };

  const doc = await (await tickets()).findOne({ ticketId });
  if (!doc) return { valid: false };

  return {
    valid: true,
    id: doc.ticketId,
    name: doc.name,
    interest: doc.interest,
    phoneLast4: String(doc.phone).slice(-4),
    issuedAt: new Date(doc.createdAt).getTime(),
  };
}