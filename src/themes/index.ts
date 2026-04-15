import { graphiteTheme } from "./graphite";
import { matrixTheme } from "./matrix";
import { paperTheme } from "./paper";
import { seaTheme } from "./sea";

export const themePresets = {
  paper: paperTheme,
  sea: seaTheme,
  graphite: graphiteTheme,
  matrix: matrixTheme
} as const;
