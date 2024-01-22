import { Guard } from "../../core";

export type Action = keyof (typeof guard)["permissions"];
export const guard = new Guard({
  downloadAll: {
    requireLogin: true,
  },
  download: {
    requireLogin: true,
  },
});
