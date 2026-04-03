import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          muted: "var(--accent-muted)",
        },
        border: {
          DEFAULT: "var(--border-default)",
          subtle: "var(--border-subtle)",
        },
        foreground: "var(--text-primary)",
        muted: "var(--text-secondary)",
        tertiary: "var(--text-tertiary)",
        amber: "var(--amber)",
        success: "var(--success)",
        error: "var(--error)",
      },
      fontFamily: {
        sans: ["var(--font-body)", "DM Sans", "ui-sans-serif", "sans-serif"],
        display: ["var(--font-display)", "Syne", "ui-sans-serif", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
