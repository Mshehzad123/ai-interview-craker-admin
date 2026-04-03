import { Suspense } from "react";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-200 text-slate-500">
          Loading…
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
