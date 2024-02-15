import type { Class, Instance } from "../types";
import { INJECTIONS } from "../globals";

export type InjectionFactory = {
  inject: () => Instance;
};

type InjectionClass = new () => Instance | InjectionFactory;

export function Injectable() {
  return function <This extends InjectionClass>(
    Class: This,
    _ctx: ClassDecoratorContext<This>
  ) {
    const injectable = new Class();

    if ("inject" in injectable) {
      INJECTIONS.set(Class, injectable.inject());
      return;
    }

    INJECTIONS.set(Class, injectable);
  };
}

export function Inject<Injection extends Instance>(key: Class) {
  return function <This extends Instance>(
    _field: undefined,
    _ctx: ClassFieldDecoratorContext<This>
  ) {
    return function () {
      return INJECTIONS.get(key) as Injection;
    };
  };
}
