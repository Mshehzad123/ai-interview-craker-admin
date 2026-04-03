"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PIE_COLORS = ["#00e5cc", "#f5a623", "#8a8a8a", "#22c55e"];

export function SignupsChart({
  data,
}: {
  data: Array<{ day: string; signups: number }>;
}) {
  return (
    <div className="h-64 w-full rounded-[var(--radius-lg)] border border-border-subtle bg-elevated p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-tertiary">
        Signups (30 days)
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fill: "#8a8a8a", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#8a8a8a", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "var(--bg-overlay)",
              border: "1px solid var(--border-default)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--text-secondary)" }}
          />
          <Line type="monotone" dataKey="signups" stroke="#00e5cc" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CreditsBarChart({
  data,
}: {
  data: Array<{ day: string; credits: number }>;
}) {
  return (
    <div className="h-64 w-full rounded-[var(--radius-lg)] border border-border-subtle bg-elevated p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-tertiary">
        Credits sold / day
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fill: "#8a8a8a", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#8a8a8a", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "var(--bg-overlay)",
              border: "1px solid var(--border-default)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar dataKey="credits" fill="#00e5cc" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenuePieChart({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  const hasData = data.some((d) => d.value > 0);
  return (
    <div className="h-64 w-full rounded-[var(--radius-lg)] border border-border-subtle bg-elevated p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-tertiary">
        Revenue by plan
      </p>
      {!hasData ? (
        <div className="flex h-[calc(100%-2rem)] items-center justify-center text-sm text-tertiary">
          No completed purchases yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                background: "var(--bg-overlay)",
                border: "1px solid var(--border-default)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
