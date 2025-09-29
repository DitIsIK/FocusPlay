"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users2, UserCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/friends", label: "Friends", icon: Users2 },
  { href: "/profile", label: "Profiel", icon: UserCircle },
  { href: "/create", label: "Create", icon: Sparkles }
];

export function NavTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex w-full items-center justify-between gap-2 rounded-3xl border border-white/5 bg-white/5 p-3 text-sm backdrop-blur">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition",
              isActive ? "bg-primary text-primary-foreground" : "text-white/60 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
