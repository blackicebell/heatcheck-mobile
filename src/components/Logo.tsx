export function Logo({ size = 56 }: { size?: number }) {
  return (
    <div
      className="relative grid place-items-center rounded-[28%] gradient-primary glow"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="none">
        <path
          d="M3 17 L8 11 L12 14 L16 7 L21 12"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="21" cy="12" r="1.6" fill="white" />
      </svg>
    </div>
  );
}
