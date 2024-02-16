import express from "express";
import https from "https";
import fs from "fs/promises";
import type { Class } from "./types";
import { MIDDLEWARES, CONTROLLERS } from "./globals";
import { StatusCode, StatusPhrase } from "./enums";
import { Inject } from "./decorators";
import { Logger } from "./logger";

export class Server {
  private readonly app = express();

  @Inject(Logger) private readonly logger!: Logger;

  constructor() {
    this.registerMiddlewares()
      .registerControllers()
      .registerNotFoundHandler()
      .registerErrorHandler();
  }

  public async listen(host: string, port: number): Promise<void> {
    const cb = (): void => {
      this.logger.info({
        msg: `The express server is listening on ${host}:${port}`,
      });
    };

    if (process.env["NODE_ENV"] === "production") {
      https
        .createServer(
          {
            cert: await fs.readFile(process.env["SSL_CERT_FILE"]!),
            key: await fs.readFile(process.env["SSL_KEY_FILE"]!),
          },
          this.app
        )
        .listen(port, host, cb);

      return;
    }

    this.app.listen(port, host, cb);
  }

  private registerMiddlewares(): this {
    for (const middleware of MIDDLEWARES) {
      this.app.use(middleware);
    }

    MIDDLEWARES.length = 0;

    return this;
  }

  private registerControllers(): this {
    const apiRouter = express.Router();

    for (const [Controller, metadata] of CONTROLLERS) {
      // must create Controller instances to make decorators' `ctx.addInitializer` work
      // eslint-disable-next-line
      new (Controller as Class)();

      const router = express.Router({ mergeParams: true });
      const { path, handlers } = metadata;

      for (const [, metadata] of handlers) {
        const { method, path, middlewares, handle } = metadata;
        router[method!](path!, middlewares?.reverse() ?? [], handle!);
      }

      apiRouter.use(path, router);

      handlers.clear();
    }

    CONTROLLERS.clear();

    this.app.use("/api/v1", apiRouter);

    return this;
  }

  private registerNotFoundHandler(): this {
    this.app.use((_req, res, _next) => {
      res.status(StatusCode.NotFound).json({ status: StatusPhrase.NotFound });
    });

    return this;
  }

  private registerErrorHandler(): this {
    this.app.use(((error, _req, res, _next) => {
      this.logger.error({ error });

      res
        .status(StatusCode.InternalServerError)
        .json({ status: StatusPhrase.InternalServerError });
    }) as express.ErrorRequestHandler);

    return this;
  }
}
