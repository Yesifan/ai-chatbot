import { createKysely } from '@vercel/postgres-kysely'
import type { Database } from '../../types/database' // this is the Database interface we defined earlier

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export default createKysely<Database>()
