import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { logger } from "../src/logger";

const postgresClient = postgres(process.env["DB_URL"]!, { max: 1 });
const db = drizzle(postgresClient);

async function run(): Promise<void> {
  logger.info({
    msg: "Running migrations...",
  });

  await migrate(db, { migrationsFolder: "migrations" });
  await postgresClient.end();

  logger.info({
    msg: "Migrations successed!",
  });
}

run().catch(async (error: Error) => {
  logger.error({ error });
  await postgresClient.end();
  throw error;
});
