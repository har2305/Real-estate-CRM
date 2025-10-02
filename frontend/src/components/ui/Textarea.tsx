import React from "react";
import { cn } from "./cn";

export default function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none px-3 py-2 text-sm text-white placeholder-gray-400",
        props.className
      )}
    />
  );
}
