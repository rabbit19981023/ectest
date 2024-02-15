import type { RequestHandler } from "express";
import helmet from "helmet";
import { Middleware, type MiddlewareFactory } from "../core";

@Middleware()
export class Helmet implements MiddlewareFactory {
  use(): RequestHandler {
    return helmet();
  }
}
