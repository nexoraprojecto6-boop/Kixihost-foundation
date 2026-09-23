import ptAO from "./pt-AO.json";
import en from "./en.json";

export const locales = { "pt-AO": ptAO, en } as const;
export type Locale = keyof typeof locales;
export const defaultLocale: Locale = "pt-AO";
