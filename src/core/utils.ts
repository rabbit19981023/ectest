// https://github.com/drizzle-team/drizzle-orm/blob/d20bd54cfbc7a8ead2b14eb24af7b73c752b80e2/examples/libsql/src/utils.ts
// the implementation is inspired by drizzle-team's example code above
export function aggregateOne2Many<
  Row extends Record<string, any>,
  One extends keyof Row,
  Many extends keyof Row,
>(
  rows: Row[],
  one: One,
  many: Many
): Array<Row[One] & Record<Many, Array<NonNullable<Row[Many]>>>> {
  const map: {
    [id in number]: { one: Row[One]; many: Array<NonNullable<Row[Many]>> };
  } = {};

  for (const row of rows) {
    const { id } = row[one];

    if (map[id] === undefined) {
      map[id] = { one: row[one], many: [] };
    }

    if (row[many] !== null) {
      map[id]!.many.push(row[many]);
    }
  }

  return Object.values(map).map((row) => ({
    ...row.one,
    [many]: row.many,
  }));
}

export function isNotEmpty(value?: string): boolean {
  return value !== undefined;
}

export function isInt(value?: string): boolean {
  return Number.isInteger(Number(value));
}

export function isJson(value?: string): boolean {
  if (value === undefined) return false;

  try {
    const json = JSON.parse(value);

    if (typeof json !== "object") return false;
    if (json === null) return false;
  } catch (err) {
    return false;
  }

  return true;
}
