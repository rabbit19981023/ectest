// vitest doesn't support standard decorators yet, so we cannot import from "../user"
import { ROLE } from "../user/schema";

export function isRole(value?: string): boolean {
  return value === undefined || Object.values(ROLE).includes(value as ROLE);
}

/** Validate the email format depends on RFC2822 standard
 * see more at https://stackoverflow.com/a/1373724 */
export function isEmail(value?: string): boolean {
  if (value === undefined) return false;

  const re =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

  return re.test(value);
}

/** Validate the password format depends on this answer: https://stackoverflow.com/a/40923568 */
export function isPassword(value?: string): boolean {
  if (value === undefined) return false;

  const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

  return re.test(value);
}
