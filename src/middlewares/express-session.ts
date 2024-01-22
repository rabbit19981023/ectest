import type { RequestHandler } from "express";
import expressSession from "express-session";
import RedisStore from "connect-redis";
import { redisClient } from "../db";

export function session(): RequestHandler {
  return expressSession({
    name: process.env["COOKIE_NAME"],
    secret: process.env["COOKIE_SESSION_SECRET"]!,
    store: new RedisStore({ client: redisClient }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env["NODE_ENV"] === "production",
      maxAge: parseInt(process.env["COOKIE_MAXAGE"]!),
    },
  });
}
