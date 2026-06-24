import { NextResponse } from "next/server";

/** Recursively convert BigInt -> Number so values can be JSON-serialized.
 *  Play-money credits stay well within Number.MAX_SAFE_INTEGER. */
export function jsonSafe<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_k, v) => (typeof v === "bigint" ? Number(v) : v)),
  );
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(jsonSafe(data), { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
