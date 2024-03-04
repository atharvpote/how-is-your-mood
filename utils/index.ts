export const PREVIEW_LENGTH = 100;

export function getDatabaseUrl() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (
    process.env.NODE_ENV === "development"
      ? process.env.DATABASE_URL_DEV
      : process.env.DATABASE_URL_MAIN
  )!;
}

export function isTouchDevice() {
  if (typeof window !== "undefined")
    return window.matchMedia("(any-pointer: coarse)").matches;

  return false;
}
