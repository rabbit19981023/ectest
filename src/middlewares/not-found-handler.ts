import type { RequestHandler } from "express";
import { StatusCode, StatusPhrase } from "../enums";

export const notFoundHandler: RequestHandler = (_req, res, _next) => {
  res.status(StatusCode.NotFound).json({ status: StatusPhrase.NotFound });
};
