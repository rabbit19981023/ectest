import postgres from "postgres";
import { createClient } from "redis";
import { drizzle } from "drizzle-orm/postgres-js";
import { logger } from "./logger";

const postgresClient = postgres(process.env["DB_URL"]!);

export const redisClient = createClient({
  socket: {
    port: parseInt(process.env["REDIS_PORT"]!),
    host: process.env["REDIS_HOST"]!,
  },
});

redisClient
  .connect()
  .then(() => {
    logger.info({ msg: "Redis client is ready!" });
  })
  .catch((error) => {
    logger.error({ error });
    throw error;
  });

export const db = drizzle(postgresClient);
