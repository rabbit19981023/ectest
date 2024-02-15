import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const postgresClient = postgres(process.env["DB_URL"]!, { max: 1 });
const db = drizzle(postgresClient);

async function run(): Promise<void> {
  console.info("Running migrations...");

  await migrate(db, { migrationsFolder: "migrations" });
  await postgresClient.end();

  console.info("Migrations successed!");
}

run().catch(async (error: Error) => {
  await postgresClient.end();
  throw error;
});
