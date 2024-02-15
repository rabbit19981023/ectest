import type { Request, Response, NextFunction } from "express";
import type { IVerifyOptions } from "passport-local";
import {
  Inject,
  Controller,
  Get,
  Post,
  StatusCode,
  StatusPhrase,
} from "../core";
import type { UserWithoutPassword } from "../user";
import { Validate } from "./decorators";
import { isRole, isEmail, isPassword } from "./utils";
import { AuthStrategy, AuthMessage, AuthError } from "./enums";
import { Authenticator } from "./authenticator";

@Controller("/auth")
export class AuthController {
  @Inject(Authenticator) private readonly authenticator!: Authenticator;

  @Post("/login")
  public login(req: Request, res: Response, next: NextFunction): void {
    this.authenticator.authenticate(AuthStrategy.Login, (error, user, info) => {
      this.authCallback(req, res, next, error, user, info);
    })(req, res, next);
  }

  @Post("/signup")
  @Validate({
    body: {
      role: {
        validate: isRole,
        fail: {
          msg: AuthMessage.SignupFail,
          reason: AuthError.RoleNotExists,
        },
      },
      email: {
        validate: isEmail,
        fail: {
          msg: AuthMessage.SignupFail,
          reason: AuthError.InvalidEmail,
        },
      },
      password: {
        validate: isPassword,
        fail: {
          msg: AuthMessage.SignupFail,
          reason: AuthError.InvalidPassword,
        },
      },
    },
  })
  public signup(req: Request, res: Response, next: NextFunction): void {
    this.authenticator.authenticate(
      AuthStrategy.Signup,
      (error, user, info) => {
        this.authCallback(req, res, next, error, user, info);
      }
    )(req, res, next);
  }

  @Get("/logout")
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
        .status(StatusCode.Unauthorized)
        .json({ status: StatusPhrase.Unauthorized, msg: info.message });

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
