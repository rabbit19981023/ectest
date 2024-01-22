import type { ErrorRequestHandler } from "express";
import { StatusCode, StatusPhrase } from "../enums";
import { logger } from "../logger";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  logger.error({ error });

  res
    .status(StatusCode.InternalServerError)
    .json({ status: StatusPhrase.InternalServerError });
};
