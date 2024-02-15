import { describe, test, expect } from "vitest";
import { aggregateOne2Many, isNotEmpty, isInt, isJson } from "./utils";

describe("aggregateOne2Many", () => {
  const dummy = {
    albumTitle: "album title",
    photoPath: "photo file path",
  };
  const { albumTitle, photoPath } = dummy;

  test("without childs", () => {
    const rows = [{ album: { id: 0, title: albumTitle }, photos: null }];
    const result = [{ id: 0, title: albumTitle, photos: [] }];

    expect(aggregateOne2Many(rows, "album", "photos")).toEqual(result);
  });

  test("with exact 1 child", () => {
    const rows = [
      {
        album: { id: 0, title: albumTitle },
        photos: { id: 1, path: photoPath },
      },
    ];
    const result = [
      {
        id: 0,
        title: albumTitle,
        photos: [{ id: 1, path: photoPath }],
      },
    ];

    expect(aggregateOne2Many(rows, "album", "photos")).toEqual(result);
  });

  test("with childs", () => {
    const rows = [
      {
        album: { id: 0, title: albumTitle },
        photos: { id: 1, path: photoPath },
      },
      {
        album: { id: 0, title: albumTitle },
        photos: { id: 3, path: photoPath },
      },
      {
        album: { id: 0, title: albumTitle },
        photos: { id: 7, path: photoPath },
      },
    ];
    const result = [
      {
        id: 0,
        title: albumTitle,
        photos: [
          { id: 1, path: photoPath },
          { id: 3, path: photoPath },
          { id: 7, path: photoPath },
        ],
      },
    ];

    expect(aggregateOne2Many(rows, "album", "photos")).toEqual(result);
  });

  test("mixed", () => {
    const rows = [
      {
        album: { id: 0, title: albumTitle },
        photos: { id: 1, path: photoPath },
      },
      {
        album: { id: 0, title: albumTitle },
        photos: { id: 3, path: photoPath },
      },
      {
        album: { id: 0, title: albumTitle },
        photos: { id: 7, path: photoPath },
      },
      {
        album: { id: 1, title: albumTitle },
        photos: null,
      },
      {
        album: { id: 2, title: albumTitle },
        photos: null,
      },
      {
        album: { id: 3, title: albumTitle },
        photos: { id: 9, path: photoPath },
      },
      {
        album: { id: 4, title: albumTitle },
        photos: { id: 11, path: photoPath },
      },
    ];
    const result = [
      {
        id: 0,
        title: albumTitle,
        photos: [
          { id: 1, path: photoPath },
          { id: 3, path: photoPath },
          { id: 7, path: photoPath },
        ],
      },
      {
        id: 1,
        title: albumTitle,
        photos: [],
      },
      {
        id: 2,
        title: albumTitle,
        photos: [],
      },
      {
        id: 3,
        title: albumTitle,
        photos: [{ id: 9, path: photoPath }],
      },
      {
        id: 4,
        title: albumTitle,
        photos: [{ id: 11, path: photoPath }],
      },
    ];

    expect(aggregateOne2Many(rows, "album", "photos")).toEqual(result);
  });
});

describe("isNotEmpty", () => {
  test("not empty: should return true", () => {
    expect(isNotEmpty("not empty")).toBeTruthy();
  });

  test("undefined: should return false", () => {
    expect(isNotEmpty(undefined)).toBeFalsy();
  });
});

describe("isInt", () => {
  test("int: should return true", () => {
    expect(isInt("57")).toBeTruthy();
  });

  test("undefined: should return false", () => {
    expect(isInt(undefined)).toBeFalsy();
  });

  test("all char: should return false", () => {
    expect(isInt("all char")).toBeFalsy();
  });

  test("float: should return false", () => {
    expect(isInt("1.5")).toBeFalsy();
  });

  test("contains char: should return false", () => {
    expect(isInt("5s")).toBeFalsy();
  });
});

describe("isJson", () => {
  test("empty object: should return true", () => {
    expect(isJson("{}")).toBeTruthy();
  });

  test("valid format: should return true", () => {
    expect(isJson('{"key": "value"}')).toBeTruthy();
  });

  test("undefined: should return false", () => {
    expect(isJson(undefined)).toBeFalsy();
  });

  test("invalid format: should return false", () => {
    expect(isJson("{'key': 'value'}")).toBeFalsy();
  });
});
