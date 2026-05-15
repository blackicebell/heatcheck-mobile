export const colors = {
  background: "#050608",
  backgroundElevated: "#0A0C10",
  surface: "#111318",
  surfaceRaised: "#191C22",
  surfaceSoft: "#232832",
  text: "#F7F4EE",
  textMuted: "#A9AFB8",
  textSubtle: "#737B88",
  border: "rgba(255,255,255,0.09)",
  green: "#44F08A",
  mint: "#7EF7D4",
  blue: "#72A7FF",
  pink: "#FF68B3",
  amber: "#FFCF5F",
  red: "#FF6B6B",
  black: "#050608",
  white: "#FFFFFF",
};

export const gradients = {
  primary: [colors.green, colors.blue] as [string, string],
  reward: [colors.pink, colors.blue] as [string, string],
  quiet: [colors.background, colors.backgroundElevated] as [string, string],
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  xxl: 42,
};

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
};

export const typography = {
  title: 34,
  h1: 28,
  h2: 22,
  h3: 18,
  body: 16,
  small: 13,
  tiny: 11,
};

export const shadows = {
  soft: {
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 26,
    elevation: 5,
  },
};

export const layout = {
  maxContentWidth: 520,
};

export const animation = {
  fast: 180,
  normal: 280,
  slow: 420,
  stagger: 80,
};
