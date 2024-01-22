import fs from "fs/promises";
import https from "https";
import express from "express";
import helmet from "helmet";
import { logger } from "./logger";
import {
  httpLogging,
  limiter,
  session,
  notFoundHandler,
  errorHandler,
} from "./middlewares";
import { authenticator } from "./auth/authenticator";
import { routes as authRoutes } from "./auth/routes";
import { routes as albumRoutes } from "./album/routes";
import { routes as downloadPhotoRoutes } from "./photo/download/routes";

export class Server {
  private readonly app: express.Application;

  constructor() {
    this.app = express();

    this.registerMiddlewares()
      .registerRoutes()
      .registerNotFoundHandler()
      .registerErrorHandler();
  }

  public async listen(host: string, port: number): Promise<void> {
    const cb = (): void => {
      logger.info({
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
    this.app.use(httpLogging());

    this.app.use(helmet());
    this.app.use(limiter);

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(session());
    this.app.use(authenticator.session());

    return this;
  }

  private registerRoutes(): this {
    const apiRouter = express.Router();

    apiRouter.use("/auth", authRoutes.getRouter());
    apiRouter.use("/albums", albumRoutes.getRouter());

    this.app.use("/api/v1", apiRouter);
    this.app.use(
      "/download/albums/:albumId/photos",
      downloadPhotoRoutes.getRouter()
    );

    return this;
  }

  private registerNotFoundHandler(): this {
    this.app.use(notFoundHandler);
    return this;
  }

  private registerErrorHandler(): this {
    this.app.use(errorHandler);
    return this;
  }
}
