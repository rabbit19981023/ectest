import type { RequestHandler } from "express";
import passport from "passport";
import { Strategy as LocalStrategy, type IVerifyOptions } from "passport-local";
import bcrypt from "bcrypt";
import { Inject, Injectable, Logger } from "../core";
import { UserService, type UserWithoutPassword } from "../user";
import { AuthStrategy, AuthMessage, AuthError } from "./enums";

@Injectable()
export class Authenticator {
  private readonly passport = new passport.Passport();

  @Inject(Logger) private readonly logger!: Logger;
  @Inject(UserService) private readonly userService!: UserService;

  constructor() {
    this.initSerializer().registerStrategies();
  }

  public session(): RequestHandler {
    return this.passport.authenticate("session");
  }

  public authenticate(
    strategy: AuthStrategy,
    callback: (
      error: Error,
      user: UserWithoutPassword | false,
      info: IVerifyOptions
    ) => void
  ): RequestHandler {
    return this.passport.authenticate(strategy, callback);
  }

  private initSerializer(): this {
    // eslint-disable-next-line
    // @ts-ignore
    this.passport.serializeUser((user: UserWithoutPassword, done) => {
      this.logger.info({
        msg: AuthMessage.NewSession,
        user,
      });

      done(null, user);
    });

    this.passport.deserializeUser((user: UserWithoutPassword, done) => {
      done(null, user);
    });

    return this;
  }

  private registerStrategies(): this {
    this.registerLoginStrategy().registerSignupStrategy();
    return this;
  }

  private registerLoginStrategy(): this {
    this.passport.use(
      AuthStrategy.Login,
      new LocalStrategy(
        { usernameField: "email" },
        // eslint-disable-next-line
        async (email, password, done) => {
          const user = await this.userService.findWithPassword(email);

          if (user !== null) {
            const { password: _, ...userWithoutPassword } = user;

            if (await bcrypt.compare(password, user.password)) {
              this.logger.info({
                msg: AuthMessage.LoginSuccess,
                user: userWithoutPassword,
              });

              done(null, userWithoutPassword);
              return;
            }

            this.logger.warn({
              msg: AuthMessage.LoginFail,
              reason: AuthError.WrongPassword,
              user: userWithoutPassword,
            });

            done(null, false, { message: AuthError.WrongPassword });
            return;
          }

          this.logger.warn({
            msg: AuthMessage.LoginFail,
            reason: AuthError.UserNotExists,
            email,
          });

          done(null, false, { message: AuthError.UserNotExists });
        }
      )
    );

    return this;
  }

  private registerSignupStrategy(): this {
    this.passport.use(
      AuthStrategy.Signup,
      new LocalStrategy(
        {
          passReqToCallback: true,
          usernameField: "email",
        },
        // eslint-disable-next-line
        async (req, email, password, done) => {
          const { role } = req.body;

          if ((await this.userService.find(email)) !== null) {
            this.logger.warn({
              msg: AuthMessage.SignupFail,
              reason: AuthError.UserAlreadyExists,
              email,
            });

            done(null, false, { message: AuthError.UserAlreadyExists });
            return;
          }

          const newUser = await this.userService.create({
            email,
            password: await bcrypt.hash(password, await bcrypt.genSalt()),
            role,
          });

          this.logger.info({
            msg: AuthMessage.SignupSuccess,
            newUser,
          });

          done(null, newUser);
        }
      )
    );

    return this;
  }
}
