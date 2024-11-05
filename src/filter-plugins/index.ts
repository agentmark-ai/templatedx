import { FilterFunction } from '../filter-registry';

export const capitalize: FilterFunction<string, string> = (input: string): string => {
  if (typeof input !== "string") return input;
  return input.charAt(0).toUpperCase() + input.slice(1);
};

export const upper: FilterFunction<string, string> = (input: string): string => {
  if (typeof input !== "string") return input;
  return input.toUpperCase();
};

export const lower: FilterFunction<string, string> = (input: string): string => {
  if (typeof input !== "string") return input;
  return input.toLowerCase();
};

export const truncate: FilterFunction<string, string> = (input: string, length: number): string => {
  if (typeof input !== "string") return input;
  if (input.length <= length) return input;
  return input.substring(0, length) + "...";
};

export const abs: FilterFunction<number, number> = (input: number): number => {
  return Math.abs(input);
};

export const join: FilterFunction<Array<any>, string>  = (input: any[], separator: string = ", "): string => {
  if (!Array.isArray(input)) return input;
  return input.join(separator);
};

export const round: FilterFunction<number, number> = (input: number, decimals: number = 0): number => {
  return Number(Math.round(Number(input + "e" + decimals)) + "e-" + decimals);
};

export const replace: FilterFunction<string, string> = (input: string, search: string, replace: string): string => {
  if (typeof input !== "string") return input;
  return input.split(search).join(replace);
};

export const urlencode: FilterFunction<string, string> = (input: string): string => {
  if (typeof input !== "string") return input;
  return encodeURIComponent(input);
};

export const dump: FilterFunction<any, string> = (input: any): string => {
  return JSON.stringify(input);
};
