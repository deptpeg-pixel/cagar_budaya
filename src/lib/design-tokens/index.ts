export * from "./colors";
export * from "./typography";

import { colors } from "./colors";
import { typography } from "./typography";

export const tokens = {
  colors,
  typography,
} as const;

export default tokens;

