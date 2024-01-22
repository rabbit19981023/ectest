import type { RequestHandler } from "express";
import { logger } from "../logger";

export function httpLogging(): RequestHandler {
  return (req, res, next) => {
    const start = performance.now();

    res.once("close", () => {
      const { hostname: host, ip, method, originalUrl: path, user } = req;
      const { statusCode } = res;
      const duration = Math.round(performance.now() - start);

      logger.info({ host, ip, method, path, user, statusCode, duration });
    });

    next();
  };
}
