import { Router } from "express";
import type { Validator, Guard } from "../../core";
import { validator, type Action as ValidatorAction } from "./validator";
import { guard, type Action as GuardAction } from "./guard";
import { controller, type Controller } from "./controller";

export class Routes {
  private readonly router: Router;
  private readonly validator: Validator<ValidatorAction>;
  private readonly guard: Guard<GuardAction>;
  private readonly controller: Controller;

  constructor(
    router: Router,
    validator: Validator<ValidatorAction>,
    guard: Guard<GuardAction>,
    controller: Controller
  ) {
    this.router = router;
    this.validator = validator;
    this.guard = guard;
    this.controller = controller;

    this.register();
  }

  public getRouter(): Router {
    return this.router;
  }

  private register(): this {
    this.router.get(
      "/",
      this.validator.validate("downloadAll"),
      this.guard.checkPermission("downloadAll"),
      (req, res, next) => {
        this.controller.downloadAll(req, res, next).catch((error) => {
          next(error);
        });
      }
    );

    this.router.get(
      "/:id",
      this.validator.validate("download"),
      this.guard.checkPermission("download"),
      (req, res, next) => {
        this.controller.download(req, res, next).catch((error) => {
          next(error);
        });
      }
    );

    return this;
  }
}

export const routes = new Routes(
  Router({ mergeParams: true }),
  validator,
  guard,
  controller
);
