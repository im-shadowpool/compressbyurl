import Link from "next/link";
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ComponentProps,
  type ReactNode,
} from "react";

import { classNames } from "@/lib/class-names";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "inverse";
export type ButtonSize = "small" | "medium" | "large";

interface ButtonVisualProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  iconOnly?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVisualProps {
  loading?: boolean;
}

export type ButtonLinkProps = Omit<
  ComponentProps<typeof Link>,
  "children" | "className"
> &
  ButtonVisualProps & {
    children: ReactNode;
    className?: string;
  };

export interface ButtonAnchorProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>, ButtonVisualProps {}

interface ButtonClassNameOptions {
  block?: boolean;
  className?: string;
  iconOnly?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export function buttonClassName({
  block = false,
  className,
  iconOnly = false,
  size = "medium",
  variant = "primary",
}: ButtonClassNameOptions = {}) {
  return classNames(
    "ui-button motion-safe-transition",
    `ui-button--${variant}`,
    `ui-button--${size}`,
    block && "ui-button--block",
    iconOnly && "ui-button--icon-only",
    className,
  );
}

function ButtonContent({
  children,
  iconOnly = false,
  leadingIcon,
  loading = false,
  trailingIcon,
}: Pick<
  ButtonProps,
  "children" | "iconOnly" | "leadingIcon" | "loading" | "trailingIcon"
>) {
  if (iconOnly) {
    return (
      <span aria-hidden="true" className="ui-button__icon">
        {loading ? <span className="ui-button__progress" /> : (leadingIcon ?? children)}
      </span>
    );
  }

  return (
    <>
      {loading ? (
        <span aria-hidden="true" className="ui-button__progress" />
      ) : leadingIcon ? (
        <span aria-hidden="true" className="ui-button__icon">
          {leadingIcon}
        </span>
      ) : null}
      <span className="ui-button__label">{children}</span>
      {!loading && trailingIcon ? (
        <span aria-hidden="true" className="ui-button__icon">
          {trailingIcon}
        </span>
      ) : null}
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    block = false,
    children,
    className,
    disabled,
    iconOnly = false,
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
      className={buttonClassName({ block, className, iconOnly, size, variant })}
      data-loading={loading || undefined}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      <ButtonContent
        iconOnly={iconOnly}
        leadingIcon={leadingIcon}
        loading={loading}
        trailingIcon={trailingIcon}
      >
        {children}
      </ButtonContent>
    </button>
  );
});

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  function ButtonLink(
    {
      block = false,
      children,
      className,
      iconOnly = false,
      leadingIcon,
      size = "medium",
      trailingIcon,
      variant = "primary",
      ...props
    },
    ref,
  ) {
    return (
      <Link
        ref={ref}
        className={buttonClassName({ block, className, iconOnly, size, variant })}
        {...props}
      >
        <ButtonContent
          iconOnly={iconOnly}
          leadingIcon={leadingIcon}
          trailingIcon={trailingIcon}
        >
          {children}
        </ButtonContent>
      </Link>
    );
  },
);

export const ButtonAnchor = forwardRef<HTMLAnchorElement, ButtonAnchorProps>(
  function ButtonAnchor(
    {
      block = false,
      children,
      className,
      iconOnly = false,
      leadingIcon,
      size = "medium",
      trailingIcon,
      variant = "primary",
      ...props
    },
    ref,
  ) {
    return (
      <a
        ref={ref}
        className={buttonClassName({ block, className, iconOnly, size, variant })}
        {...props}
      >
        <ButtonContent
          iconOnly={iconOnly}
          leadingIcon={leadingIcon}
          trailingIcon={trailingIcon}
        >
          {children}
        </ButtonContent>
      </a>
    );
  },
);
