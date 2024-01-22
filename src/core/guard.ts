import type { Request, RequestHandler } from "express";
import { StatusCode, StatusPhrase } from "../enums";

type Permissions<Action extends string> = {
  [action in Action]: {
    requireLogin: boolean;
    check?: (req: Request) => boolean;
  };
};

export class Guard<Action extends string> {
  private readonly permissions: Permissions<Action>;

  constructor(permissions: Permissions<Action>) {
    this.permissions = permissions;
  }

  public checkPermission(action: Action): RequestHandler {
    return (req, res, next) => {
      const { requireLogin, check } = this.permissions[action];

      if (requireLogin && req.user === undefined) {
        res
          .status(StatusCode.Unauthorized)
          .json({ status: StatusPhrase.Unauthorized });

        return;
      }

      if (check !== undefined && !check(req)) {
        res
          .status(StatusCode.Forbidden)
          .json({ status: StatusPhrase.Forbidden });

        return;
      }

      next();
    };
  }
}
