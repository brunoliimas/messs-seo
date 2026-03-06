import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Singleton para evitar múltiplas conexões em dev (hot reload)
const globalForDb = globalThis as unknown as {
  connection: ReturnType<typeof postgres> | undefined;
};

const connection =
  globalForDb.connection ??
  postgres(process.env.DATABASE_URL!, {
    prepare: false, // Necessário para Supabase connection pooling (PgBouncer)
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.connection = connection;
}

export const db = drizzle(connection, { schema });

// Re-export schema para conveniência
export { schema };
