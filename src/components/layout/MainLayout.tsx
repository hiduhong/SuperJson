import React from "react";
import { cn } from "../../utils/cn";

interface MainLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export const MainLayout = ({
  children,
  header,
  sidebar,
  className,
}: MainLayoutProps) => {
  return (
    <div className={cn("flex flex-col h-screen w-screen overflow-hidden bg-zinc-950", className)}>
      {header && <header className="flex-shrink-0 h-14 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm z-10">{header}</header>}
      <div className="flex flex-1 overflow-hidden">
        {sidebar && <aside className="flex-shrink-0 w-64 border-r border-zinc-800 bg-zinc-900/30 hidden md:block">{sidebar}</aside>}
        <main className="flex-1 relative overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};
