import type { Request, Response, NextFunction } from "express";
import type { IVerifyOptions } from "passport-local";
import { AuthStrategy, StatusCode, StatusPhrase } from "../enums";
import type { UserWithoutPassword } from "../user/schema";
import { authenticator, type Authenticator } from "./authenticator";

export class Controller {
  private readonly authenticator: Authenticator;

  constructor(authenticator: Authenticator) {
    this.authenticator = authenticator;
  }

  public login(req: Request, res: Response, next: NextFunction): void {
    this.authenticator.authenticate(AuthStrategy.Login, (error, user, info) => {
      this.authCallback(req, res, next, error, user, info);
    })(req, res, next);
  }

  public signup(req: Request, res: Response, next: NextFunction): void {
    this.authenticator.authenticate(
      AuthStrategy.Signup,
      (error, user, info) => {
        this.authCallback(req, res, next, error, user, info);
      }
    )(req, res, next);
  }

  public logout(req: Request, res: Response, next: NextFunction): void {
    const { user } = req;

    req.logout((error) => {
      // a small hacking to make http-logging contains the logged-out user info
      req.user = user;

      if (error !== undefined) {
        next(error);
        return;
      }

      res.status(StatusCode.Ok).json({ status: StatusPhrase.Ok });
    });
  }

  private authCallback(
    req: Request,
    res: Response,
    next: NextFunction,
    _error: Error | null, // `_error` will always be `null` because we never pass any error value in `done()`
    user: UserWithoutPassword | false,
    info: IVerifyOptions
  ): void {
    if (user === false) {
      res
        .status(StatusCode.BadRequest)
        .json({ status: StatusPhrase.BadRequest, msg: info.message });

      return;
    }

    req.login(user, (error) => {
      if (error !== undefined) {
        next(error);
        return;
      }

      res.status(StatusCode.Ok).json({ status: StatusPhrase.Ok });
    });
  }
}

export const controller = new Controller(authenticator);
