export const colors = {
  darkCanvas: "#0c0d0e",
  darkCard: "#141517",
  win95Surface: "#d4d0c8",
  win95Light: "#ffffff",
  win95Shadow: "#808080",
  win95Dark: "#404040",
  accentBlue: "#0078d7",
  accentCyan: "#00f0ff",
  accentGreen: "#28a745",
  textMain: "#f3f4f6",
  textMuted: "#9ca3af",
} as const;

export type AppColor = keyof typeof colors;
