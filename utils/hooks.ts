"use client";

import { useState } from "react";

export function usePrefersColor() {
  const [isDark, setIsDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) =>
      event.matches ? setIsDark(true) : setIsDark(false),
    );

  return isDark;
}
