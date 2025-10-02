import React from "react";
import { cn } from "./cn";

export default function Alert({
  children,
  className,
  variant = "error",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "error" | "success" | "info";
}) {
  const map = {
    error: "bg-rose-50 text-rose-700 border border-rose-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    info: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  } as const;

  return (
    <div className={cn("rounded-lg px-3 py-2 text-sm", map[variant], className)}>
      {children}
    </div>
  );
}
