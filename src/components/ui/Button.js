import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";

const VARIANTS = {
  primary: "btn-gold",
  secondary: "btn-wood",
  ghost: "bg-transparent text-fg/80 hover:bg-surface hover:text-fg",
  outline: "bg-transparent border border-accent/60 text-accent hover:bg-accent/10",
};

const SIZES = {
  sm: "text-sm px-3.5 py-2 gap-1.5",
  md: "text-sm px-5 py-2.5 gap-2",
  lg: "text-base px-6 py-3 gap-2",
};

/** Polymorphic button — renders a Next <Link> when `href` is set. */
const Button = forwardRef(function Button(
  { as, href, variant = "primary", size = "md", className, children, ...props },
  ref
) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-lg font-semibold tracking-tight transition-all duration-200 focus-ring disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] active:translate-y-px",
    VARIANTS[variant],
    SIZES[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} ref={ref} {...props}>
        {children}
      </Link>
    );
  }
  const Comp = as || "button";
  return (
    <Comp className={classes} ref={ref} {...props}>
      {children}
    </Comp>
  );
});

export default Button;

