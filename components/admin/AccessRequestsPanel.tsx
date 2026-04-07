"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccessRequestRow = {
  id: string;
  email: string;
  requestedAt: string;
  status: string;
};

type Filter = "all" | "pending" | "approved" | "rejected";

const tabs: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "pending") {
    return (
      <span className="inline-flex rounded-md border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-400">
        Pending
      </span>
    );
  }
  if (s === "approved") {
    return (
      <span className="inline-flex rounded-md border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
        Approved
      </span>
    );
  }
  if (s === "rejected") {
    return (
      <span className="inline-flex rounded-md border border-red-500/35 bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-400">
        Rejected
      </span>
    );
  }
  return (
    <span className="text-xs text-muted capitalize">{status}</span>
  );
}

export function AccessRequestsPanel({ rows }: { rows: AccessRequestRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.status.toLowerCase() === filter);
  }, [rows, filter]);

  async function patchAction(id: string, action: "approve" | "reject") {
    setErr(null);
    setBusyId(id);
    try {
      const res = await fetch(`/api/access-requests/${id}/${action}`, { method: "PATCH" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Request failed");
        return;
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("whispr-admin-pending-refresh"));
      }
      router.refresh();
    } catch {
      setErr("Network error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Access Requests</h1>
        <p className="mt-1 text-sm text-muted">Approve or reject Whispr signup requests.</p>
      </div>

      {err ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--error)]/30 bg-[var(--error-dim)] px-3 py-2 text-sm text-[var(--error)]">
          {err}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={cn(
              "rounded-[var(--radius-md)] border px-3 py-1.5 text-xs font-semibold transition-colors",
              filter === t.id
                ? "border-accent bg-accent/15 text-accent"
                : "border-border-subtle bg-elevated text-muted hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border-subtle bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-[11px] font-semibold uppercase tracking-wider text-tertiary">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Requested At</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted">
                  No requests in this view.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const pending = r.status.toLowerCase() === "pending";
                const loading = busyId === r.id;
                return (
                  <tr key={r.id} className="border-b border-border-subtle/80 last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{r.email}</td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(r.requestedAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {pending ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => patchAction(r.id, "approve")}
                            className="inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-emerald-600/90 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve ✓
                          </button>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => patchAction(r.id, "reject")}
                            className="inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-red-600/90 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject ✗
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-tertiary">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
