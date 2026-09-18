import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { classNames } from "@/lib/class-names";

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "children"
> {
  label: string;
  icon: ReactNode;
  size?: "small" | "medium";
  variant?: "primary" | "secondary" | "ghost" | "danger" | "inverse";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      className,
      icon,
      label,
      size = "medium",
      type = "button",
      variant = "secondary",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        aria-label={label}
        className={classNames(
          "ui-icon-button motion-safe-transition",
          `ui-icon-button--${variant}`,
          `ui-icon-button--${size}`,
          className,
        )}
        title={label}
        type={type}
        {...props}
      >
        {icon}
      </button>
    );
  },
);
