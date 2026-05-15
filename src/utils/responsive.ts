export function getResponsiveHorizontalPadding(width: number) {
  if (width >= 430) {
    return 28;
  }

  if (width <= 360) {
    return 18;
  }

  return 22;
}
