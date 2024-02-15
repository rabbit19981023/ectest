import type { RequestHandler } from "express";
import type { RedisClientType } from "redis";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import {
  Inject,
  Middleware,
  RedisClient,
  type MiddlewareFactory,
} from "../core";

@Middleware()
export class RateLimiter implements MiddlewareFactory {
  @Inject(RedisClient) private readonly redisClient!: RedisClientType;

  public use(): RequestHandler {
    return rateLimit({
      // these config uses the recommendations in the official documentation
      store: new RedisStore({
        sendCommand: async (...args: string[]) => {
          return await this.redisClient.sendCommand(args);
        },
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });
  }
}
