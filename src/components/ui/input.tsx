"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";

import { classNames } from "@/lib/class-names";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, hint, id, label, required, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={inputId}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        ref={ref}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={classNames("ui-input", error && "ui-input--error", className)}
        id={inputId}
        required={required}
        {...props}
      />
      {hint ? (
        <span className="ui-field__hint" id={hintId}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="ui-field__error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
});
