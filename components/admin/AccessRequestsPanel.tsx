"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

type HistoryItem = {
  id: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: string;
  note: string | null;
};

type ConfirmKind = "approve" | "reject" | null;

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

function formatHistoryLine(h: HistoryItem): string {
  const d = new Date(h.changedAt);
  const when = d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  return `${h.newStatus} by ${h.changedBy} on ${when}`;
}

export function AccessRequestsPanel({ rows }: { rows: AccessRequestRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [confirm, setConfirm] = useState<{
    kind: ConfirmKind;
    row: AccessRequestRow | null;
  }>({ kind: null, row: null });

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.status.toLowerCase() === filter);
  }, [rows, filter]);

  const selectedRow = useMemo(
    () => (selectedId ? rows.find((r) => r.id === selectedId) ?? null : null),
    [rows, selectedId]
  );

  const loadHistory = useCallback(async (userId: string) => {
    setHistoryLoading(true);
    setHistory([]);
    try {
      const res = await fetch(`/api/access-requests/${userId}/status-history`);
      const data = (await res.json().catch(() => ({}))) as { items?: HistoryItem[] };
      if (res.ok && Array.isArray(data.items)) {
        setHistory(data.items);
      }
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) void loadHistory(selectedId);
  }, [selectedId, loadHistory]);

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
      setConfirm({ kind: null, row: null });
      router.refresh();
      if (selectedId === id) void loadHistory(id);
    } catch {
      setErr("Network error");
    } finally {
      setBusyId(null);
    }
  }

  function openConfirm(row: AccessRequestRow, kind: "approve" | "reject") {
    setConfirm({ kind, row });
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
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-[11px] font-semibold uppercase tracking-wider text-tertiary">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Requested At</th>
              <th className="px-4 py-3 text-right">Status &amp; actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-sm text-muted">
                  No requests in this view.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const st = r.status.toLowerCase();
                const pending = st === "pending";
                const approved = st === "approved";
                const rejected = st === "rejected";
                const loading = busyId === r.id;
                const rowSelected = selectedId === r.id;
                return (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedId((id) => (id === r.id ? null : r.id))}
                    className={cn(
                      "cursor-pointer border-b border-border-subtle/80 last:border-0 transition-colors",
                      rowSelected ? "bg-accent/5" : "hover:bg-elevated/40"
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{r.email}</td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(r.requestedAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <StatusBadge status={r.status} />
                        {pending ? (
                          <>
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => openConfirm(r, "approve")}
                              className="inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-emerald-600/90 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve ✓
                            </button>
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => openConfirm(r, "reject")}
                              className="inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-red-600/90 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject ✗
                            </button>
                          </>
                        ) : null}
                        {approved ? (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => openConfirm(r, "reject")}
                            className="inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-red-600/90 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject ✗
                          </button>
                        ) : null}
                        {rejected ? (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => openConfirm(r, "approve")}
                            className="inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-emerald-600/90 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve ✓
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedRow ? (
        <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-tertiary">Status history</p>
          <p className="mt-1 text-sm text-muted">
            {selectedRow.email}
            <span className="text-tertiary"> · click row again to collapse</span>
          </p>
          <div className="mt-4 border-t border-border-subtle pt-4">
            {historyLoading ? (
              <p className="text-sm text-muted">Loading…</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted">No status changes recorded yet.</p>
            ) : (
              <ul className="space-y-2 text-sm text-foreground">
                {history.map((h) => (
                  <li key={h.id} className="text-muted">
                    <span className="text-foreground">{formatHistoryLine(h)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}

      {confirm.kind && confirm.row ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-5 shadow-xl">
            <h2 id="confirm-title" className="font-display text-lg font-semibold text-foreground">
              {confirm.kind === "approve" ? "Approve access" : "Revoke access"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {confirm.kind === "approve" ? (
                <>
                  Are you sure you want to approve <strong className="text-foreground">{confirm.row.email}</strong>?
                  They will receive a login email immediately.
                </>
              ) : confirm.row.status.toLowerCase() === "approved" ? (
                <>
                  Are you sure you want to revoke access for{" "}
                  <strong className="text-foreground">{confirm.row.email}</strong>? They will no longer be able to log
                  in.
                </>
              ) : (
                <>
                  Are you sure you want to reject the access request for{" "}
                  <strong className="text-foreground">{confirm.row.email}</strong>?
                </>
              )}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm({ kind: null, row: null })}
                className="rounded-[var(--radius-md)] border border-border-subtle px-3 py-2 text-xs font-semibold text-muted transition hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyId !== null}
                onClick={() => {
                  if (!confirm.row || !confirm.kind) return;
                  void patchAction(confirm.row.id, confirm.kind === "approve" ? "approve" : "reject");
                }}
                className={cn(
                  "rounded-[var(--radius-md)] px-3 py-2 text-xs font-semibold text-white transition disabled:opacity-50",
                  confirm.kind === "approve" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"
                )}
              >
                {confirm.kind === "approve" ? "Yes, Approve" : "Yes, Revoke"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
