import { MutableRefObject } from "react";
import { SetState } from "./types";

export const PREVIEW_LENGTH = 100;

export function handleModal(
  modal: MutableRefObject<HTMLDialogElement | null>,
  activate: boolean,
) {
  if (!modal.current) throw new Error("Modal in null");

  activate ? modal.current.showModal() : modal.current.close();
}

export function adjustUiForTouchDevice(setState: SetState<boolean>) {
  isTouchDevice() ? setState(true) : setState(false);
}

export function isTouchDevice() {
  if (typeof window !== "undefined")
    return window.matchMedia("(any-pointer: coarse)").matches;

  return false;
}

export async function getRequestData(request: Request) {
  const data: unknown = await request.json();

  return data;
}

export function createPreview(content: string) {
  return content.substring(0, PREVIEW_LENGTH);
}

export function isValidDateRange(start: Date, end: Date) {
  return start.getTime() <= end.getTime();
}

export function deserializeDate<T extends { date: string }>(data: T) {
  return { ...data, date: new Date(data.date) };
}
