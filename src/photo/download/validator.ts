import { Validator } from "../../core";

export type Action = keyof (typeof validator)["validations"];
export const validator = new Validator({
  downloadAll: {
    params: {
      albumId: (id?: string) => Validator.isInt(id),
    },
  },
  download: {
    params: {
      albumId: (id?: string) => Validator.isInt(id),
      id: (id?: string) => Validator.isInt(id),
    },
  },
});
