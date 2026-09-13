"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";

import { classNames } from "@/lib/class-names";

export interface SegmentedControlOption<T extends string> {
  label: string;
  value: T;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string> {
  label: string;
  options: readonly SegmentedControlOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  className,
  label,
  onValueChange,
  options,
  value,
}: SegmentedControlProps<T>) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectAdjacent(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const direction =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;

    if (direction === 0) return;

    event.preventDefault();
    let nextIndex = index;

    for (let offset = 1; offset <= options.length; offset += 1) {
      const candidate = (index + direction * offset + options.length) % options.length;
      if (!options[candidate]?.disabled) {
        nextIndex = candidate;
        break;
      }
    }

    const option = options[nextIndex];
    if (option) {
      onValueChange(option.value);
      itemRefs.current[nextIndex]?.focus();
    }
  }

  return (
    <div
      aria-label={label}
      className={classNames("ui-segmented", className)}
      role="radiogroup"
    >
      {options.map((option, index) => {
        const selected = option.value === value;

        return (
          <button
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            aria-checked={selected}
            className="ui-segmented__item motion-safe-transition"
            disabled={option.disabled}
            key={option.value}
            onClick={() => onValueChange(option.value)}
            onKeyDown={(event) => selectAdjacent(event, index)}
            role="radio"
            tabIndex={selected ? 0 : -1}
            type="button"
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
