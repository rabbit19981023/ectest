import type { RequestHandler } from "express";
import { StatusCode, StatusPhrase } from "../enums";

type Validations<Action extends string> = {
  [action in Action]: {
    [param in "query" | "params"]?: {
      [fieldKey in string]: (fieldValue?: string) => boolean;
    };
  } & {
    [param in "body"]?: { [fieldKey in string]: (fieldValue?: any) => boolean };
  };
};

type ExpressParam = "query" | "params" | "body";

export class Validator<Action extends string> {
  private readonly validations: Validations<Action>;

  constructor(validations: Validations<Action>) {
    this.validations = validations;
  }

  public validate(action: Action): RequestHandler {
    return (req, res, next) => {
      for (const [param, fields] of Object.entries(this.validations[action])) {
        for (const [fieldKey, validate] of Object.entries(fields)) {
          const fieldValue = req[param as ExpressParam][fieldKey] as
            | string
            | undefined;

          if (!validate(fieldValue)) {
            res
              .status(StatusCode.BadRequest)
              .json({ status: StatusPhrase.BadRequest });

            return;
          }
        }
      }

      next();
    };
  }

  static isNotEmpty(value?: string): boolean {
    return value !== undefined;
  }

  static isInt(value?: string): boolean {
    return Number.isInteger(Number(value));
  }

  static isJson(value?: string): boolean {
    if (value === undefined) return false;

    try {
      const json = JSON.parse(value);

      if (typeof json !== "object") return false;
      if (json === null) return false;
    } catch (err) {
      return false;
    }

    return true;
  }
}
