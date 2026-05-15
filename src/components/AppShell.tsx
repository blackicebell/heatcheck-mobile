import { ReactNode } from "react";

export function AppShell({ children, withTabs = false }: { children: ReactNode; withTabs?: boolean }) {
  return (
    <div className="min-h-screen bg-app text-foreground">
      <div className={`mx-auto w-full max-w-md ${withTabs ? "pb-28" : ""}`}>{children}</div>
    </div>
  );
}
