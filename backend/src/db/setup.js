// One-command schema setup: npm run db:setup
// Reads schema.sql and runs it against DATABASE_URL.

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || "");
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  try {
    await pool.query(sql);
    console.log("✅ Database schema is up to date.");
  } catch (err) {
    console.error("❌ Failed to set up the database:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
