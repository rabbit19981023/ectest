import type { RequestHandler } from "express";
import {
  StatusCode,
  StatusPhrase,
  AuthMessage,
  AuthError,
  ROLE,
} from "../enums";
import { logger } from "../logger";

type Validations<Action extends string> = {
  [action in Action]: {
    [param in "body"]?: {
      [fieldKey in string]: {
        validate: (fieldValue?: string) => boolean;
        fail: {
          msg: string;
          reason: string;
        };
      };
    };
  };
};

export class Validator<Action extends string> {
  private readonly validations: Validations<Action>;

  constructor(validations: Validations<Action>) {
    this.validations = validations;
  }

  public validate(action: Action): RequestHandler {
    return (req, res, next) => {
      for (const [param, fields] of Object.entries(this.validations[action])) {
        for (const [fieldKey, validationInfo] of Object.entries(fields)) {
          const fieldValue = req[param as "body"][fieldKey] as
            | string
            | undefined;

          const {
            validate,
            fail: { msg, reason },
          } = validationInfo;

          if (!validate(fieldValue)) {
            logger.warn({
              msg,
              reason,
              [fieldKey]: fieldKey === "password" ? undefined : fieldValue,
            });

            res
              .status(StatusCode.BadRequest)
              .json({ status: StatusPhrase.BadRequest, msg: reason });

            return;
          }
        }
      }

      next();
    };
  }

  static isRole(value?: string): boolean {
    return value === undefined || Object.values(ROLE).includes(value as ROLE);
  }

  /** Validate the email format depends on RFC2822 standard
   * see more at https://stackoverflow.com/a/1373724 */
  static isEmail(value?: string): boolean {
    if (value === undefined) return false;

    const re =
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

    return re.test(value);
  }

  /** Validate the password format depends on this answer: https://stackoverflow.com/a/40923568 */
  static isPassword(value?: string): boolean {
    if (value === undefined) return false;

    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

    return re.test(value);
  }
}

export type Action = keyof (typeof validator)["validations"];
export const validator = new Validator({
  signup: {
    body: {
      role: {
        validate: (role?: string) => Validator.isRole(role),
        fail: {
          msg: AuthMessage.SignupFail,
          reason: AuthError.RoleNotExists,
        },
      },
      email: {
        validate: (email?: string) => Validator.isEmail(email),
        fail: {
          msg: AuthMessage.SignupFail,
          reason: AuthError.InvalidEmail,
        },
      },
      password: {
        validate: (password?: string) => Validator.isPassword(password),
        fail: {
          msg: AuthMessage.SignupFail,
          reason: AuthError.InvalidPassword,
        },
      },
    },
  },
});
