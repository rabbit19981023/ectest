import { Validator } from "../core";

export type Action = keyof (typeof validator)["validations"];
export const validator = new Validator({
  find: {
    params: {
      id: (id?: string) => Validator.isInt(id),
    },
  },
  create: {
    body: {
      title: (title?: string) => Validator.isNotEmpty(title),
    },
  },
  update: {
    params: {
      id: (id?: string) => Validator.isInt(id),
    },
    body: {
      title: (title?: string) => Validator.isNotEmpty(title),
    },
  },
  delete: {
    params: {
      id: (id?: string) => Validator.isInt(id),
    },
  },
});
