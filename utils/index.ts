export const PREVIEW_LENGTH = 100;

export function isTouchDevice() {
  if (typeof window !== "undefined")
    return window.matchMedia("(any-pointer: coarse)").matches;

  return false;
}
