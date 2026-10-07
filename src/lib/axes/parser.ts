import type { AxesProfile, AxesValues } from "./types";

const AXIS_NAMES: (keyof AxesValues)[] = [
  "est",
  "rep",
  "pod",
  "imi",
  "dip",
  "int",
  "eco",
  "con",
  "com",
  "rel",
  "mor",
  "tec",
];

function isValidAxisValue(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

export function parseAxesUrl(input: string): AxesProfile {
  let url: URL;

  try {
    url = new URL(input.trim());
  } catch {
    throw new Error("Invalid URL.");
  }

  const values = {} as AxesValues;

  for (const axis of AXIS_NAMES) {
    const parameter = url.searchParams.get(axis);

    if (parameter === null) {
      throw new Error(`The URL is missing the "${axis}" axis.`);
    }
    const value = Number(parameter);

    if (!isValidAxisValue(value)) {
      throw new Error(
        `Invalid value for "${axis}". Expected a number between 0 and 100.`,
      );
    }
    values[axis] = value;
  }

  return {
    values,
    religion: url.searchParams.get("religion") ?? undefined,
  };
}
