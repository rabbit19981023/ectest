// middlewares & controllers must be imported before `Server`
import "./middlewares";
import "./controllers";

import { Server } from "./core";

function bootstrap(): void {
  const host = process.env["SERVER_HOST"]!;
  const port = parseInt(process.env["SERVER_PORT"]!);
  const server = new Server();

  server.listen(host, port).catch((error) => {
    throw error;
  });
}

bootstrap();
