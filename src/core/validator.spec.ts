import { describe, test, expect } from "vitest";
import { Validator } from "./validator";

describe("isNotEmpty", () => {
  test("not empty: should return true", () => {
    expect(Validator.isNotEmpty("not empty")).toBeTruthy();
  });

  test("undefined: should return false", () => {
    expect(Validator.isNotEmpty(undefined)).toBeFalsy();
  });
});

describe("isInt", () => {
  test("int: should return true", () => {
    expect(Validator.isInt("57")).toBeTruthy();
  });

  test("undefined: should return false", () => {
    expect(Validator.isInt(undefined)).toBeFalsy();
  });

  test("all char: should return false", () => {
    expect(Validator.isInt("all char")).toBeFalsy();
  });

  test("float: should return false", () => {
    expect(Validator.isInt("1.5")).toBeFalsy();
  });

  test("contains char: should return false", () => {
    expect(Validator.isInt("5s")).toBeFalsy();
  });
});

describe("isJson", () => {
  test("empty object: should return true", () => {
    expect(Validator.isJson("{}")).toBeTruthy();
  });

  test("valid format: should return true", () => {
    expect(Validator.isJson('{"key": "value"}')).toBeTruthy();
  });

  test("undefined: should return false", () => {
    expect(Validator.isJson(undefined)).toBeFalsy();
  });

  test("invalid format: should return false", () => {
    expect(Validator.isJson("{'key': 'value'}")).toBeFalsy();
  });
});
