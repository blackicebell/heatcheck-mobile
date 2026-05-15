import { DarkTheme } from "@react-navigation/native";

import { colors } from "@/theme/tokens";

export const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.green,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
    notification: colors.pink,
  },
};
