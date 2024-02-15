import type { RequestHandler } from "express";
import {
  INJECTIONS,
  Use,
  Logger,
  StatusCode,
  StatusPhrase,
  type Instance,
} from "../core";

type Field = "email" | "password" | "role";
type ValidateFunc = (field?: string) => boolean;
type ValidateTarget = Record<
  "body",
  Record<
    Field,
    { validate: ValidateFunc; fail: { msg: string; reason: string } }
  >
>;

export function Validate(
  targets: ValidateTarget
): <This extends Instance>(
  handler: RequestHandler,
  ctx: ClassMethodDecoratorContext<This>
) => void {
  const logger = INJECTIONS.get(Logger) as Logger;

  return Use((req, res, next) => {
    const fields = targets.body;

    for (const [field, metadata] of Object.entries(fields)) {
      const {
        validate,
        fail: { msg, reason },
      } = metadata;
      const value = req.body[field] as string | undefined;

      if (!validate(value)) {
        logger.warn({
          msg,
          reason,
          [field]: field === "password" ? undefined : value,
        });

        res
          .status(StatusCode.BadRequest)
          .json({ status: StatusPhrase.BadRequest, msg: reason });

        return;
      }
    }

    next();
  });
}
