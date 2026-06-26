export const FIELD_TYPES = [
  "TEXT",
  "EMAIL",
  "NUMBER",
  "YES_NO",
  "PASSWORD",
  "SELECT",
  "MULTI_SELECT",
  "DATE",
  "TIME",
  "RATING",
  "TAGS",
  "TOGGLE",
  "RADIO",
  "CHECKBOX",
  "TEXTAREA",
  "FILE_UPLOAD",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];
