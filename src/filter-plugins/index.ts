export interface Filters {
  capitalize(input: string): string;
  upper(input: string): string;
  lower(input: string): string;
  truncate(input: string, length: number): string;
  abs(input: number): number;
  join(input: any[], separator?: string): string;
  round(input: number, decimals?: number): number;
  replace(input: string, search: string, replace: string): string;
  urlencode(input: string): string;
  dump(input: any): string;
}

export const capitalize = (input: string): string => {
  if (typeof input !== "string") return input;
  return input.charAt(0).toUpperCase() + input.slice(1);
};

export const upper = (input: string): string => {
  if (typeof input !== "string") return input;
  return input.toUpperCase();
};

export const lower = (input: string): string => {
  if (typeof input !== "string") return input;
  return input.toLowerCase();
};

export const truncate = (input: string, length: number): string => {
  if (typeof input !== "string") return input;
  if (input.length <= length) return input;
  return input.substring(0, length) + "...";
};

export const abs = (input: number): number => {
  return Math.abs(input);
};

export const join = (input: any[], separator: string = ", "): string => {
  if (!Array.isArray(input)) return input;
  return input.join(separator);
};

export const round = (input: number, decimals: number = 0): number => {
  return Number(Math.round(Number(input + "e" + decimals)) + "e-" + decimals);
};

export const replace = (input: string, search: string, replace: string): string => {
  if (typeof input !== "string") return input;
  return input.split(search).join(replace);
};

export const urlencode = (input: string): string => {
  if (typeof input !== "string") return input;
  return encodeURIComponent(input);
};

export const dump = (input: any): string => {
  return JSON.stringify(input);
};
