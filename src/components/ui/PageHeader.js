import { cn } from "@/utils/cn";

export default function PageHeader({ eyebrow, title, subtitle, align = "left", className, children }) {
  return (
    <header
      className={cn("flex flex-col gap-4", align === "center" && "items-center text-center", className)}
    >
      {eyebrow ? (
        <span className="lcd-plate inline-flex w-fit items-center gap-2 rounded-md px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.2em]">
          <span className="lcd">{eyebrow}</span>
        </span>
      ) : null}
      <h1 className="text-3xl font-semibold leading-tight text-fg sm:text-[2.6rem]">
        {title}
      </h1>
      {subtitle ? (
        <p className="max-w-2xl text-base leading-relaxed text-muted">{subtitle}</p>
      ) : null}
      {children}
    </header>
  );
}

