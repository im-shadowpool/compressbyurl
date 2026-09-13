import type { HTMLAttributes } from "react";

type ResponsiveGridColumns = 2 | 3 | 4;

export interface ResponsiveGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: ResponsiveGridColumns;
}

export function ResponsiveGrid({
  columns = 2,
  className,
  ...props
}: ResponsiveGridProps) {
  const classes = ["layout-grid", `layout-grid--${columns}`, className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
}
