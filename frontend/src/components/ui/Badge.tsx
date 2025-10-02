import React from "react";
import { cn } from "./cn";

export default function Badge({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700", className)}>
      {children}
    </span>
  );
}
