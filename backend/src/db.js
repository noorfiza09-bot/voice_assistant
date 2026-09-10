// Single shared connection pool. Every route imports `query` from here
// instead of creating its own client — pg pools handle concurrency for us.

import pg from "pg";

// Hosted providers (Neon, Supabase, Railway, etc.) require SSL, but a local
// Postgres on your own machine usually doesn't have it set up. This detects
// which situation we're in from the connection string itself, so the same
// code works either way without you needing to configure anything.
const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || "");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle Postgres client", err);
});

export function query(text, params) {
  return pool.query(text, params);
}

export default pool;
