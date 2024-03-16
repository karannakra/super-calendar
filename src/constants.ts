import * as chrono from "chrono-node";

type StringMap<T> = Record<string, T>;

export const dayJsUnits: chrono.Component[] = [
  "millisecond",
  "second",
  "minute",
  "hour",
  "day",
  "month",
  "year",
];

// define your lookup helper functions here, using only the first two letters

export const stringToInt: StringMap<number> = {
  a: 1,
  an: 1,
  on: 1,
  tw: 2,
  th: 3,
  fo: 4,
  fi: 5,
  si: 6,
  se: 7,
  ei: 8,
  ni: 9,
  te: 10,
};

export const stringToMonth: StringMap<string> = {
  a: "aug",
  au: "aug",
  d: "dc",
  de: "dec",
  f: "feb",
  fe: "feb",
  j: "jan jun jul",
  ja: "jan",
  ju: "jun jul",
  m: "mar may",
  ma: "mar may",
  n: "nov",
  no: "nov",
  o: "oct",
  oc: "oct",
  s: "sep",
  se: "sep",
};

export const fixedDate = ["tomorrow", "today"];
export const weekdays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const nextUnits = ["week", "month", "quarter", "year"] as const;
export const inUnits = ["minutes", "hours", "days", "weeks", "months", "years"] as const;
export const shortcutRegex = /(\d)([a-zA-Z])/g;
