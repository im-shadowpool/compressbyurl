"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";

import { classNames } from "@/lib/class-names";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { className, description, id, label, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;

  return (
    <label className={classNames("ui-switch", className)} htmlFor={inputId}>
      <input
        ref={ref}
        aria-describedby={descriptionId}
        className="ui-switch__input"
        id={inputId}
        type="checkbox"
        {...props}
      />
      <span aria-hidden="true" className="ui-switch__track">
        <span className="ui-switch__thumb" />
      </span>
      <span className="ui-switch__text">
        <span className="ui-switch__label">{label}</span>
        {description ? (
          <span className="ui-switch__description" id={descriptionId}>
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
});
