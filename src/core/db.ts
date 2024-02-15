import { createClient } from "redis";
import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Instance } from "./types";
import { Inject, Injectable, type InjectionFactory } from "./decorators";
import { Logger } from "./logger";

@Injectable()
export class RedisClient implements InjectionFactory {
  @Inject(Logger) private readonly logger!: Logger;

  public inject(): Instance {
    const redisClient = createClient({
      socket: {
        port: parseInt(process.env["REDIS_PORT"]!),
        host: process.env["REDIS_HOST"]!,
      },
    });

    redisClient
      .connect()
      .then(() => {
        this.logger.info({ msg: "Redis client is ready!" });
      })
      .catch((error) => {
        this.logger.error({ error });
        throw error;
      });

    return redisClient;
  }
}

@Injectable()
export class DrizzleOrm implements InjectionFactory {
  public inject(): PostgresJsDatabase {
    const postgresClient = postgres(process.env["DB_URL"]!);
    return drizzle(postgresClient);
  }
}
