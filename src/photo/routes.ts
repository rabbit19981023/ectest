import { Router } from "express";
import type { Validator, Guard } from "../core";
import { uploadParser } from "../middlewares";
import { validator, type Action as ValidateAction } from "./validator";
import { guard, type Action as GuardAction } from "./guard";
import { controller, type Controller } from "./controller";

export class Routes {
  private readonly router: Router;
  private readonly validator: Validator<ValidateAction>;
  private readonly guard: Guard<GuardAction>;
  private readonly controller: Controller;

  constructor(
    router: Router,
    validator: Validator<ValidateAction>,
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
      this.validator.validate("findAll"),
      this.guard.checkPermission("findAll"),
      (req, res, next) => {
        this.controller.findAll(req, res).catch((error) => {
          next(error);
        });
      }
    );

    this.router.get(
      "/:id",
      this.validator.validate("find"),
      this.guard.checkPermission("find"),
      (req, res, next) => {
        this.controller.find(req, res).catch((error) => {
          next(error);
        });
      }
    );

    this.router.post(
      "/",
      this.validator.validate("create"),
      this.guard.checkPermission("create"),
      uploadParser(),
      this.validator.validate("upload_create"),
      (req, res, next) => {
        this.controller.create(req, res).catch((error) => {
          next(error);
        });
      }
    );

    this.router.put(
      "/:id",
      this.validator.validate("update"),
      this.guard.checkPermission("update"),
      uploadParser(),
      this.validator.validate("upload_update"),
      (req, res, next) => {
        this.controller.update(req, res).catch((error) => {
          next(error);
        });
      }
    );

    this.router.delete(
      "/:id",
      this.validator.validate("delete"),
      this.guard.checkPermission("delete"),
      (req, res, next) => {
        this.controller.delete(req, res).catch((error) => {
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
