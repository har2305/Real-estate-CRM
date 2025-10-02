import { cn } from "./cn";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface BaseProps {
  variant?: Variant;
  className?: string;
  disabled?: boolean;
}

interface ButtonProps extends BaseProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  as?: "button";
  children: React.ReactNode;
}

interface LinkProps extends BaseProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  as: "a";
  children: React.ReactNode;
}

type Props = ButtonProps | LinkProps;

const styles: Record<Variant, string> = {
  primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm",
  secondary: "bg-slate-200 hover:bg-slate-300 text-slate-900",
  danger: "bg-rose-600 hover:bg-rose-700 text-white",
  ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
};

export default function Button({ className, variant = "primary", as = "button", disabled, ...rest }: Props) {
  const baseClasses = "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors";
  const variantClasses = styles[variant];
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  const combinedClasses = cn(baseClasses, variantClasses, disabledClasses, className);

  if (as === "a") {
    const { as: _, ...anchorProps } = rest as LinkProps;
    return (
      <a
        className={combinedClasses}
        {...anchorProps}
      />
    );
  }

  const { as: _, ...buttonProps } = rest as ButtonProps;
  return (
    <button
      className={combinedClasses}
      disabled={disabled}
      {...buttonProps}
    />
  );
}
