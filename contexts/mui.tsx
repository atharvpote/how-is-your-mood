"use client";

import { ThemeProvider } from "@emotion/react";
import { createTheme, useMediaQuery } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { ReadonlyPropsWithChildren } from "@/utils/types";

export default function MUIContext({ children }: ReadonlyPropsWithChildren) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const colors = createTheme({
    palette: { primary: { main: "#a6adbb" }, secondary: { main: "#2a323c" } },
  });

  const overrides = createTheme({
    palette: {
      mode: prefersDarkMode ? "dark" : "light",
      primary: {
        main: "#4a00ff",
        contrastText: "#d7dde4",
      },
    },
    components: {
      MuiFormControl: {
        styleOverrides: {
          root: {
            width: "9.5rem",
          },
        },
      },

      MuiInputBase: {
        styleOverrides: {
          root: {
            color: colors.palette.primary.main,
            backgroundColor: colors.palette.secondary.main,
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: { root: { color: colors.palette.primary.main } },
      },
    },
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ThemeProvider theme={overrides}>{children}</ThemeProvider>
    </LocalizationProvider>
  );
}
