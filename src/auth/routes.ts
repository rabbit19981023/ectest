import { Router } from "express";
import { validator, type Validator, type Action } from "./validator";
import { controller, type Controller } from "./controller";

export class Routes {
  private readonly router: Router;
  private readonly validator: Validator<Action>;
  private readonly controller: Controller;

  constructor(
    router: Router,
    validator: Validator<Action>,
    controller: Controller
  ) {
    this.router = router;
    this.validator = validator;
    this.controller = controller;

    this.register();
  }

  public getRouter(): Router {
    return this.router;
  }

  private register(): this {
    this.router.post("/login", (req, res, next) => {
      this.controller.login(req, res, next);
    });

    this.router.post(
      "/signup",
      this.validator.validate("signup"),
      (req, res, next) => {
        this.controller.signup(req, res, next);
      }
    );

    this.router.get("/logout", (req, res, next) => {
      this.controller.logout(req, res, next);
    });

    return this;
  }
}

export const routes = new Routes(Router(), validator, controller);
