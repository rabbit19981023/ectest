import { describe, test, expect } from "vitest";
import { isRole, isEmail, isPassword } from "./utils";

describe("isRole", () => {
  test("value of enum ROLE: should return true", () => {
    expect(isRole("user")).toBeTruthy();
    expect(isRole("admin")).toBeTruthy();
  });

  test("undefined: should return true (if undefined, use default value )", () => {
    expect(isRole(undefined)).toBeTruthy();
  });

  test("not the value of enum ROLE: should return false", () => {
    expect(isRole("unknown role")).toBeFalsy();
  });
});

describe("isEmail", () => {
  test("valid format: should return true", () => {
    const emails = ["user01@mail", "user01@mail.com", "user01@main.com.tw"];

    for (const email of emails) {
      expect(isEmail(email)).toBeTruthy();
    }
  });

  test("undefined: should return false", () => {
    expect(isEmail(undefined)).toBeFalsy();
  });

  test("invalid format: should return false", () => {
    const emails = ["user01", "user01mail", "user01mail.com", "user01@ma"];

    for (const email of emails) {
      expect(isEmail(email)).toBeFalsy();
    }
  });
});

describe("isPassword", () => {
  test("should >= 8 characters, and include at least 1 capital, lower, and number", () => {
    expect(isPassword("Passw0rd")).toBeTruthy();
  });

  test("undefined: should return false", () => {
    expect(isPassword(undefined)).toBeFalsy();
  });

  test("< 8 characters: should return false", () => {
    expect(isPassword("Passw0r")).toBeFalsy();
  });

  test("no capital: should return false", () => {
    expect(isPassword("passw0rd")).toBeFalsy();
  });

  test("no lower case: should return false", () => {
    expect(isPassword("PASSW8RD")).toBeFalsy();
  });

  test("no number: should return false", () => {
    expect(isPassword("Password")).toBeFalsy();
  });
});
