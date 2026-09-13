"use client";

import { forwardRef, useId, type SelectHTMLAttributes } from "react";

import { MaterialSymbol } from "@/components/icons";
import { classNames } from "@/lib/class-names";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: readonly SelectOption[];
  hint?: string;
  error?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, error, hint, id, label, options, placeholder, required, ...props },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={selectId}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <div className="ui-select-wrap">
        <select
          ref={ref}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className={classNames("ui-select", error && "ui-select--error", className)}
          id={selectId}
          required={required}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option disabled={option.disabled} key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <MaterialSymbol className="ui-select__icon" name="expand_more" size={20} />
      </div>
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
