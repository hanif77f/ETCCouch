import { cn } from "@/utils/cn";

/** Elevated surface. Composed by GameCard. */
export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "panel-flat group relative overflow-hidden rounded-xl border transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

