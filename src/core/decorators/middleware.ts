import type { RequestHandler } from "express";
import { MIDDLEWARES } from "../globals";

export type MiddlewareFactory = {
  use: () => RequestHandler;
};

type MiddlewareClass = new () => MiddlewareFactory;

export function Middleware() {
  return function <This extends MiddlewareClass>(
    Middlware: This,
    _ctx: ClassDecoratorContext<This>
  ) {
    const middleware = new Middlware();
    MIDDLEWARES.push(middleware.use());
  };
}
