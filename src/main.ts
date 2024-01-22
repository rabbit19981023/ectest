import { logger } from "./logger";
import { Server } from "./server";

function bootstrap(): void {
  const host = process.env["SERVER_HOST"]!;
  const port = parseInt(process.env["SERVER_PORT"]!);
  const server = new Server();

  server.listen(host, port).catch((error) => {
    logger.error({ error });
    throw error;
  });
}

bootstrap();
