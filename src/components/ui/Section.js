import Container from "./Container";
import { cn } from "@/utils/cn";

export default function Section({ id, className, containerClassName, children }) {
  return (
    <section id={id} className={cn("py-12 sm:py-16", className)}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

