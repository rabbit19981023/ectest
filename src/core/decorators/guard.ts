import type { Request, RequestHandler } from "express";
import type { Instance } from "../types";
import { StatusCode, StatusPhrase } from "../enums";
import { Use } from "./controller";

export function UseGuard(
  check: (req: Request) => boolean
): <This extends Instance>(
  handler: RequestHandler,
  ctx: ClassMethodDecoratorContext<This>
) => void {
  return Use((req, res, next) => {
    if (check(req)) {
      next();
      return;
    }

    res.status(StatusCode.Forbidden).json({ status: StatusPhrase.Forbidden });
  });
}

export function RequireLogin(): <This extends Instance>(
  handler: RequestHandler,
  ctx: ClassMethodDecoratorContext<This>
) => void {
  return Use((req, res, next) => {
    if (req.user === undefined) {
      res
        .status(StatusCode.Unauthorized)
        .json({ status: StatusPhrase.Unauthorized });

      return;
    }

    next();
  });
}
