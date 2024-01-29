import { NeonDialect } from "kysely-neon";
import {config} from '@/config/server'
import { neonConfig } from "@neondatabase/serverless";
import { Kysely } from "kysely";
import type { Database } from '../../types/database' // this is the Database interface we defined earlier

if (!config.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not set");
}

// https://gal.hagever.com/posts/running-vercel-postgres-locally
// if we're running locally
if (config.POSTGRES_URL.includes("localhost")) {
  console.log("Running locally!")
  // Set the WebSocket proxy to work with the local instance
  neonConfig.wsProxy = (host) => `${host}:5433/v1`;
  // Disable all authentication and encryption
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
}

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.

export default new Kysely<Database>({
  dialect: new NeonDialect({
    connectionString: process.env.POSTGRES_URL,
  }),
});
