import { Validator } from "../core";
import type { File } from "../middlewares/upload-parser";

export type Action = keyof (typeof validator)["validations"];
export const validator = new Validator({
  findAll: {
    params: {
      albumId: (id?: string) => Validator.isInt(id),
    },
  },
  find: {
    params: {
      albumId: (id?: string) => Validator.isInt(id),
      id: (id?: string) => Validator.isInt(id),
    },
  },
  create: {
    params: {
      albumId: (id?: string) => Validator.isInt(id),
    },
  },
  update: {
    params: {
      albumId: (id?: string) => Validator.isInt(id),
      id: (id?: string) => Validator.isInt(id),
    },
  },
  delete: {
    params: {
      albumId: (id?: string) => Validator.isInt(id),
      id: (id?: string) => Validator.isInt(id),
    },
  },
  upload_create: {
    body: {
      files: (files?: File[]) => {
        return (
          files !== undefined &&
          files.every((file) => file.chunks !== undefined)
        );
      },
      descriptions: (descriptions?: string[]) => {
        return (
          descriptions === undefined ||
          (descriptions.length === 1 && Validator.isJson(descriptions[0]))
        );
      },
    },
  },
  upload_update: {
    body: {
      file: (file?: File[]) => {
        return (
          file === undefined ||
          (file.length === 1 && file[0]?.chunks !== undefined)
        );
      },
      description: (description?: string[]) => {
        return (
          description === undefined ||
          (description.length === 1 && !Validator.isJson(description[0]))
        );
      },
    },
  },
});
