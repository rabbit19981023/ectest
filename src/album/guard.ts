import { Guard } from "../core";

export type Action = keyof (typeof guard)["permissions"];
export const guard = new Guard({
  findAll: {
    requireLogin: true,
  },
  find: {
    requireLogin: true,
  },
  create: {
    requireLogin: true,
  },
  update: {
    requireLogin: true,
  },
  delete: {
    requireLogin: true,
  },
});
