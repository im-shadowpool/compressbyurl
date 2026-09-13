import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { classNames } from "@/lib/class-names";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "small" | "medium";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className,
    disabled,
    leadingIcon,
    loading = false,
    size = "medium",
    trailingIcon,
    type = "button",
    variant = "primary",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      aria-busy={loading || undefined}
      className={classNames(
        "ui-button motion-safe-transition",
        `ui-button--${variant}`,
        `ui-button--${size}`,
        className,
      )}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading ? (
        <span className="ui-button__progress" aria-hidden="true" />
      ) : (
        leadingIcon
      )}
      <span>{children}</span>
      {!loading && trailingIcon}
    </button>
  );
});
