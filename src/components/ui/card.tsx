import { forwardRef, type HTMLAttributes } from "react";

import { classNames } from "@/lib/class-names";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "muted" | "dark" | "lavender";
  padding?: "none" | "compact" | "default";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, padding = "default", variant = "default", ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={classNames(
        "ui-card",
        `ui-card--${variant}`,
        `ui-card--padding-${padding}`,
        className,
      )}
      {...props}
    />
  );
});
