import type { RequestHandler } from "express";
import type { Instance } from "../types";
import { StatusCode, StatusPhrase } from "../enums";
import { Use } from "./controller";

type Param = "query" | "params" | "body";
type Field = string;
type ValidateFunc = (field?: any) => boolean;
type ValidateTarget = Partial<Record<Param, Record<Field, ValidateFunc>>>;

export function Validate(
  targets: ValidateTarget
): <This extends Instance>(
  handler: RequestHandler,
  ctx: ClassMethodDecoratorContext<This>
) => void {
  return Use((req, res, next) => {
    for (const [param, fields] of Object.entries(targets)) {
      for (const [field, validate] of Object.entries(fields)) {
        const value = req[param as Param][field] as string | undefined;

        if (!validate(value)) {
          res
            .status(StatusCode.BadRequest)
            .json({ json: StatusPhrase.BadRequest });

          return;
        }
      }
    }

    next();
  });
}
