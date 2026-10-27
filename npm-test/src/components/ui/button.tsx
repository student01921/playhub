import Link from "next/link";
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "terracotta" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "border-transparent bg-forest text-paper-light shadow-[0_12px_28px_-16px_rgba(23,42,34,0.8)] hover:bg-forest-soft active:translate-y-px active:shadow-pressed",
  secondary:
    "border-forest/20 bg-white/58 text-forest shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_24px_-20px_rgba(23,42,34,0.5)] hover:border-forest/35 hover:bg-white/85 active:translate-y-px",
  terracotta:
    "border-transparent bg-terracotta text-white shadow-[0_12px_28px_-16px_rgba(168,93,64,0.9)] hover:bg-terracotta-deep active:translate-y-px",
  ghost: "border-transparent bg-transparent text-forest hover:bg-forest/8 active:bg-forest/10",
  dark: "border-white/15 bg-white/10 text-paper-light backdrop-blur-md hover:bg-white/16 active:translate-y-px",
};

const sizes: Record<Size, string> = {
  sm: "min-h-10 px-3.5 py-2 text-[0.82rem]",
  md: "min-h-11 px-5 py-2.5 text-[0.9rem]",
  lg: "min-h-12 px-6 py-3.5 text-[0.95rem]",
};

const base =
  "inline-flex touch-target items-center justify-center gap-2 rounded-xl border font-sans font-bold leading-none tracking-[-0.01em] transition duration-200 ease-soft disabled:pointer-events-none disabled:opacity-50";

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, type = "button", children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});
