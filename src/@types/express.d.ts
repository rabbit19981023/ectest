import type { UserWithoutPassword } from "../user";

declare global {
  declare namespace Express {
    // eslint-disable-next-line
    interface User extends UserWithoutPassword {}
  }
}
