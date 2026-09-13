import type { HTMLAttributes } from "react";

type ContainerSize = "content" | "wide" | "bleed";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
}

export function Container({ size = "wide", className, ...props }: ContainerProps) {
  const classes = ["layout-container", `layout-container--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
}
