import type { UserWithoutPassword } from "../user/schema";

declare global {
  declare namespace Express {
    // eslint-disable-next-line
    interface User extends UserWithoutPassword {}
  }
}
