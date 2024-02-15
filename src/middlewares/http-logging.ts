import type { RequestHandler } from "express";
import { Inject, Middleware, Logger, type MiddlewareFactory } from "../core";

@Middleware()
export class HttpLogging implements MiddlewareFactory {
  @Inject(Logger) private readonly logger!: Logger;

  public use(): RequestHandler {
    return (req, res, next) => {
      const start = performance.now();

      res.once("close", () => {
        const { hostname: host, ip, method, originalUrl: path, user } = req;
        const { statusCode } = res;
        const duration = Math.round(performance.now() - start);

        this.logger.info({
          host,
          ip,
          method,
          path,
          user,
          statusCode,
          duration,
        });
      });

      next();
    };
  }
}
