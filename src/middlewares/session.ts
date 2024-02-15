import type { RequestHandler } from "express";
import type { RedisClientType } from "redis";
import session from "express-session";
import RedisStore from "connect-redis";
import {
  Inject,
  Middleware,
  RedisClient,
  type MiddlewareFactory,
} from "../core";
import { Authenticator } from "../auth";

@Middleware()
export class Session implements MiddlewareFactory {
  @Inject(RedisClient) private readonly redisClient!: RedisClientType;

  public use(): RequestHandler {
    return session({
      name: process.env["COOKIE_NAME"],
      secret: process.env["COOKIE_SESSION_SECRET"]!,
      store: new RedisStore({ client: this.redisClient }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env["NODE_ENV"] === "production",
        maxAge: parseInt(process.env["COOKIE_MAXAGE"]!),
      },
    });
  }
}

@Middleware()
export class PassportSession implements MiddlewareFactory {
  @Inject(Authenticator) private readonly authenticator!: Authenticator;

  public use(): RequestHandler {
    return this.authenticator.session();
  }
}
