"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { AdminDataEmpty } from "@/components/admin/AdminDataEmpty";

export type CustomerRow = {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  createdAt: string;
  sessions: number;
  documents: number;
  purchases: number;
};

export function CustomersPanel({ users }: { users: CustomerRow[] }) {
  const [selected, setSelected] = useState<CustomerRow | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Users</h1>
        <p className="mt-1 text-sm text-muted">
          {users.length} most recent accounts (max 200). Same database as the main app.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-surface shadow-[var(--shadow-md)]">
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[800px]">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Credits</th>
                <th>Sessions</th>
                <th>Docs</th>
                <th>Purchases</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className={cn("cursor-pointer", selected?.id === u.id && "bg-elevated")}
                  onClick={() => setSelected(u)}
                >
                  <td className="max-w-[220px] truncate font-mono text-xs">{u.email}</td>
                  <td className="text-muted">{u.name ?? "—"}</td>
                  <td className="tabular-nums text-foreground">{u.credits}</td>
                  <td className="tabular-nums text-muted">{u.sessions}</td>
                  <td className="tabular-nums text-muted">{u.documents}</td>
                  <td className="tabular-nums text-muted">{u.purchases}</td>
                  <td className="whitespace-nowrap text-muted">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected ? (
        <>
          <button
            type="button"
            aria-label="Close panel"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border-subtle bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-foreground">User detail</h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="btn-ghost rounded-lg p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5 text-sm">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-tertiary">Email</p>
                <p className="mt-1 font-mono text-xs text-foreground">{selected.email}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-tertiary">Name</p>
                <p className="mt-1 text-foreground">{selected.name ?? "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-3">
                  <p className="text-[11px] uppercase tracking-wider text-tertiary">Credits</p>
                  <p className="mt-1 font-mono text-xl text-accent">{selected.credits}</p>
                </div>
                <div className="rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-3">
                  <p className="text-[11px] uppercase tracking-wider text-tertiary">Sessions</p>
                  <p className="mt-1 font-mono text-xl text-foreground">{selected.sessions}</p>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-tertiary">Joined</p>
                <p className="mt-1 text-muted">{formatDate(selected.createdAt)}</p>
              </div>
              <p className="text-xs text-tertiary">
                Read-only detail. Product actions remain in the main app.
              </p>
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
