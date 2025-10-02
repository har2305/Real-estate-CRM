import React from "react";
import { cn } from "./cn";

export default function Label(
  props: React.LabelHTMLAttributes<HTMLLabelElement>
) {
  return (
    <label
      {...props}
      className={cn("text-sm font-semibold text-slate-800", props.className)}
    />
  );
}
