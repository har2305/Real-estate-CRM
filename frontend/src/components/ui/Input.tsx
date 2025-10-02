import React from "react";
import { cn } from "./cn";

export default function Input(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-lg bg-white border border-slate-300 focus:border-indigo-500 focus:outline-none px-3 py-2 text-sm text-slate-900 placeholder-slate-400",
        props.className
      )}
    />
  );
}
