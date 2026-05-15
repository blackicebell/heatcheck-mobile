type Platform = "spotify" | "youtube" | "instagram" | "soundcloud";

export function PlatformIcon({ platform, size = 22 }: { platform: Platform; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24" } as const;
  switch (platform) {
    case "spotify":
      return (
        <svg {...common} fill="currentColor" className="text-spotify">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.5 14.4a.75.75 0 0 1-1 .25c-2.7-1.65-6.1-2-10.1-1.1a.75.75 0 1 1-.3-1.45c4.4-1 8.2-.6 11.2 1.25.35.2.45.65.2 1.05Zm1.2-2.7a.95.95 0 0 1-1.3.3c-3.1-1.9-7.8-2.45-11.5-1.35a.95.95 0 1 1-.55-1.8c4.25-1.25 9.45-.65 13 1.55.45.3.6.9.35 1.3Zm.1-2.8c-3.7-2.2-9.85-2.4-13.4-1.3a1.1 1.1 0 1 1-.65-2.1c4.05-1.25 10.85-1 15.1 1.5a1.1 1.1 0 1 1-1.05 1.9Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common} fill="currentColor" className="text-youtube">
          <path d="M23 12s0-3.6-.45-5.3a2.8 2.8 0 0 0-2-2C18.85 4.25 12 4.25 12 4.25s-6.85 0-8.55.45a2.8 2.8 0 0 0-2 2C1 8.4 1 12 1 12s0 3.6.45 5.3a2.8 2.8 0 0 0 2 2c1.7.45 8.55.45 8.55.45s6.85 0 8.55-.45a2.8 2.8 0 0 0 2-2C23 15.6 23 12 23 12ZM10 15.5v-7l6 3.5-6 3.5Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2" className="text-instagram">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
      );
    case "soundcloud":
      return (
        <svg {...common} fill="currentColor" className="text-soundcloud">
          <path d="M2 15v3h1v-3H2Zm2 -1v5h1v-5H4Zm2 -1v6h1v-6H6Zm2 -1v7h1v-7H8Zm2 -1v8h1v-8h-1Zm2 -2v10h1V9h-1Zm2 1c.5-3 5-3 5 0v8h-5V10Z" />
        </svg>
      );
  }
}
