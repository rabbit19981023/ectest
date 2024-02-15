import type { RequestHandler } from "express";
import type { Class, Instance } from "../types";
import { Method } from "../enums";
import { CONTROLLERS } from "../globals";

export function Controller(path: string) {
  return function <This extends Class>(
    _Controller: This,
    ctx: ClassDecoratorContext<This>
  ) {
    ctx.addInitializer(function (this) {
      CONTROLLERS.set(this, { path, handlers: new Map() });
    });
  };
}

function _registerRouteHandler<This extends Instance>(
  handler: RequestHandler,
  ctx: ClassMethodDecoratorContext<This>,
  method: Method,
  path: string
): void {
  ctx.addInitializer(function (this) {
    const handlers = CONTROLLERS.get(this.constructor)?.handlers;

    if (handlers === undefined) {
      throw new Error(
        "Did you forget to decorate your Controller Class with `@Controller(path: string)`?"
      );
    }

    let metadata = handlers.get(handler);

    if (metadata === undefined) {
      metadata = {};
      handlers.set(handler, metadata);
    }

    metadata.method = method;
    metadata.path = path;
    metadata.handle = handler.bind(this);
  });
}

export function Get(path: string) {
  return function <This extends Instance>(
    handler: RequestHandler,
    ctx: ClassMethodDecoratorContext<This>
  ) {
    _registerRouteHandler(handler, ctx, Method.GET, path);
  };
}

export function Post(path: string) {
  return function <This extends Instance>(
    handler: RequestHandler,
    ctx: ClassMethodDecoratorContext<This>
  ) {
    _registerRouteHandler(handler, ctx, Method.POST, path);
  };
}

export function Put(path: string) {
  return function <This extends Instance>(
    handler: RequestHandler,
    ctx: ClassMethodDecoratorContext<This>
  ) {
    _registerRouteHandler(handler, ctx, Method.PUT, path);
  };
}

export function Delete(path: string) {
  return function <This extends Instance>(
    handler: RequestHandler,
    ctx: ClassMethodDecoratorContext<This>
  ) {
    _registerRouteHandler(handler, ctx, Method.DELETE, path);
  };
}

export function Use(middleware: RequestHandler) {
  return function <This extends Instance>(
    handler: RequestHandler,
    ctx: ClassMethodDecoratorContext<This>
  ) {
    ctx.addInitializer(function (this) {
      const handlers = CONTROLLERS.get(this.constructor)?.handlers;

      if (handlers === undefined) {
        throw new Error(
          "Did you forget to decorate your Controller Class with `@Controller(path: string)`?"
        );
      }

      let metadata = handlers.get(handler);

      if (metadata === undefined) {
        metadata = { middlewares: [] };
        handlers.set(handler, metadata);
      }

      metadata.middlewares!.push(middleware);
    });
  };
}
