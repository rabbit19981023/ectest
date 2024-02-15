import express from "express";
import { Middleware, type MiddlewareFactory } from "../core";

@Middleware()
export class ExpressJson implements MiddlewareFactory {
  use(): express.RequestHandler {
    return express.json();
  }
}

@Middleware()
export class ExpressUrlencoded implements MiddlewareFactory {
  use(): express.RequestHandler {
    return express.urlencoded({ extended: true });
  }
}
