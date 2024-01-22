import { describe, test, expect } from "vitest";
import { Validator } from "./validator";

describe("isRole", () => {
  test("value of enum ROLE: should return true", () => {
    expect(Validator.isRole("user")).toBeTruthy();
    expect(Validator.isRole("admin")).toBeTruthy();
  });

  test("undefined: should return true (if undefined, use default value )", () => {
    expect(Validator.isRole(undefined)).toBeTruthy();
  });

  test("not the value of enum ROLE: should return false", () => {
    expect(Validator.isRole("unknown role")).toBeFalsy();
  });
});

describe("isEmail", () => {
  test("valid format: should return true", () => {
    const emails = ["user01@mail", "user01@mail.com", "user01@main.com.tw"];

    for (const email of emails) {
      expect(Validator.isEmail(email)).toBeTruthy();
    }
  });

  test("undefined: should return false", () => {
    expect(Validator.isEmail(undefined)).toBeFalsy();
  });

  test("invalid format: should return false", () => {
    const emails = ["user01", "user01mail", "user01mail.com", "user01@ma"];

    for (const email of emails) {
      expect(Validator.isEmail(email)).toBeFalsy();
    }
  });
});

describe("isPassword", () => {
  test("should >= 8 characters, and include at least 1 capital, lower, and number", () => {
    expect(Validator.isPassword("Passw0rd")).toBeTruthy();
  });

  test("undefined: should return false", () => {
    expect(Validator.isPassword(undefined)).toBeFalsy();
  });

  test("< 8 characters: should return false", () => {
    expect(Validator.isPassword("Passw0r")).toBeFalsy();
  });

  test("no capital: should return false", () => {
    expect(Validator.isPassword("passw0rd")).toBeFalsy();
  });

  test("no lower case: should return false", () => {
    expect(Validator.isPassword("PASSW8RD")).toBeFalsy();
  });

  test("no number: should return false", () => {
    expect(Validator.isPassword("Password")).toBeFalsy();
  });
});
