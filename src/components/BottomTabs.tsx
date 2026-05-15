import { Link, useLocation } from "@tanstack/react-router";
import { Home, Sparkles, Disc3, Users, User } from "lucide-react";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/insights", label: "Insights", icon: Sparkles },
  { to: "/releases", label: "Releases", icon: Disc3 },
  { to: "/audience", label: "Audience", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomTabs() {
  const { pathname } = useLocation();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none">
      <div className="mx-auto w-full max-w-md px-4 pb-4 pointer-events-auto">
        <nav className="glass card-shadow rounded-full px-2 py-2 flex items-center justify-between">
          {tabs.map((t) => {
            const active = pathname === t.to;
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className="relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-full transition-colors"
              >
                {active && (
                  <span className="absolute inset-1 rounded-full gradient-primary opacity-90 glow-soft" />
                )}
                <Icon
                  className={`relative h-5 w-5 ${active ? "text-white" : "text-muted-foreground"}`}
                  strokeWidth={active ? 2.4 : 2}
                />
                <span
                  className={`relative text-[10px] font-medium ${active ? "text-white" : "text-muted-foreground"}`}
                >
                  {t.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
