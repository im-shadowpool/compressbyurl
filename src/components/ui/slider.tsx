"use client";

import { forwardRef, useId, type CSSProperties, type InputHTMLAttributes } from "react";

import { classNames } from "@/lib/class-names";

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  hint?: string;
  formatValue?: (value: number) => string;
}

type SliderStyle = CSSProperties & { "--slider-progress": string };

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    className,
    formatValue = (value) => String(value),
    hint,
    id,
    label,
    max = 100,
    min = 0,
    value,
    defaultValue,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const sliderId = id ?? generatedId;
  const hintId = hint ? `${sliderId}-hint` : undefined;
  const numericMin = Number(min);
  const numericMax = Number(max);
  const numericValue = Number(value ?? defaultValue ?? numericMin);
  const range = numericMax - numericMin;
  const progress = range > 0 ? ((numericValue - numericMin) / range) * 100 : 0;
  const style: SliderStyle = {
    "--slider-progress": `${Math.min(100, Math.max(0, progress))}%`,
  };

  return (
    <div className="ui-field">
      <div className="ui-slider__heading">
        <label className="ui-field__label" htmlFor={sliderId}>
          {label}
        </label>
        <output className="ui-slider__value" htmlFor={sliderId}>
          {formatValue(numericValue)}
        </output>
      </div>
      <input
        ref={ref}
        aria-describedby={hintId}
        aria-valuetext={formatValue(numericValue)}
        className={classNames("ui-slider", className)}
        defaultValue={defaultValue}
        id={sliderId}
        max={max}
        min={min}
        style={style}
        type="range"
        value={value}
        {...props}
      />
      {hint ? (
        <span className="ui-field__hint" id={hintId}>
          {hint}
        </span>
      ) : null}
    </div>
  );
});
