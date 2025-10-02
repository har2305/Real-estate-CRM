import { cn } from "./cn";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusColors = {
  new: "bg-sky-100 text-sky-700",
  contacted: "bg-indigo-100 text-indigo-700", 
  qualified: "bg-emerald-100 text-emerald-700",
  negotiation: "bg-amber-100 text-amber-700",
  closed: "bg-gray-200 text-gray-800",
  lost: "bg-rose-100 text-rose-700",
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = (status || "new").toLowerCase();
  const colorClass = statusColors[normalizedStatus as keyof typeof statusColors] || statusColors.new;
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
      colorClass,
      className
    )}>
      {status || "new"}
    </span>
  );
}
