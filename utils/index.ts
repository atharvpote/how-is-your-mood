import { RefObject } from "react";

export function showPicker(element: RefObject<HTMLInputElement | null>) {
  return () => {
    if (!element.current) throw new Error("Input date is null");

    element.current.showPicker();
  };
}

export function isTouchDevice() {
  return typeof window !== "undefined"
    ? window.matchMedia("(any-pointer: coarse)").matches
    : false;
}

export function contentPreview(content: string) {
  return content.substring(0, previewLength);
}

export function isValidDateRange(start: Date, end: Date) {
  return start.getTime() >= end.getTime();
}

export function deserializeDate<T extends { date: string }>(data: T) {
  return { ...data, date: new Date(data.date) };
}

export const previewLength = 100;
