import type { RequestHandler } from "express";
import type { Class, Instance } from "./types";
import type { Method } from "./enums";

// this type is just for readability
type ControllerClass = object;

export const MIDDLEWARES: RequestHandler[] = [];
export const CONTROLLERS = new Map<
  ControllerClass,
  {
    path: string;
    handlers: Map<
      RequestHandler,
      {
        method?: Method;
        path?: string;
        middlewares?: RequestHandler[];
        handle?: RequestHandler;
      }
    >;
  }
>();
export const INJECTIONS = new WeakMap<Class, Instance>();
