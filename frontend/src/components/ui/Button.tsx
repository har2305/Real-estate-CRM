import React from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "danger" | "ghost";
interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm",
  secondary: "bg-slate-200 hover:bg-slate-300 text-slate-900",
  danger: "bg-rose-600 hover:bg-rose-700 text-white",
  ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
};

export default function Button({ className, variant = "primary", ...rest }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        styles[variant],
        className
      )}
      {...rest}
    />
  );
}
