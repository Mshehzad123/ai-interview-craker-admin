"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  CreditCard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/customers", label: "Users", icon: Users },
  { href: "/sessions", label: "Sessions", icon: CalendarClock },
  { href: "/purchases", label: "Revenue", icon: CreditCard },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="flex min-h-screen bg-base">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[220px] transform border-r border-border-subtle bg-surface text-foreground transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center border-b border-border-subtle px-4">
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            ParakeetAI
          </span>
          <span className="ml-2 rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent">
            Admin
          </span>
        </div>
        <nav className="space-y-0.5 p-2">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-l-[3px] border-accent bg-accent/10 text-accent"
                    : "border-l-[3px] border-transparent text-muted hover:bg-elevated hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-border-subtle p-2">
          <button
            type="button"
            onClick={logout}
            className="btn-ghost flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col lg:pl-0">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border-subtle bg-surface/95 px-4 backdrop-blur-md lg:px-8">
          <button
            type="button"
            className="btn-ghost rounded-lg p-2 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded border border-accent/25 bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
              Admin Panel
            </span>
            <span className="text-tertiary">/</span>
            <span className="capitalize text-muted">
              {pathname === "/" ? "overview" : pathname.replace("/", "")}
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
