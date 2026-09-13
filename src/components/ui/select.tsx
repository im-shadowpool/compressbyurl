"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { MaterialSymbol } from "@/components/icons";
import { useAnchoredPopover } from "@/components/ui/use-anchored-popover";
import { classNames } from "@/lib/class-names";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps {
  label: string;
  options: readonly SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  hint?: string;
  error?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  autoFocus?: boolean;
}

export function Select({
  autoFocus,
  className,
  disabled,
  error,
  hint,
  id,
  label,
  name,
  onValueChange,
  options,
  placeholder,
  value,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const labelId = `${selectId}-label`;
  const listboxId = `${selectId}-listbox`;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const selectedOption = options.find((option) => option.value === value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { panelRef, popoverSupported } = useAnchoredPopover({
    open,
    onClose: () => setOpen(false),
    getAnchor: () => triggerRef.current,
    gap: 6,
    matchAnchorWidth: true,
  });

  function firstEnabledIndex() {
    const index = options.findIndex((option) => !option.disabled);
    return index >= 0 ? index : 0;
  }

  function selectedIndex() {
    const index = options.findIndex((option) => option.value === value);
    return index >= 0 ? index : firstEnabledIndex();
  }

  function openListbox() {
    setActiveIndex(selectedIndex());
    setOpen(true);
  }

  function moveActive(delta: 1 | -1) {
    setActiveIndex((current) => {
      let next = current;
      for (let step = 0; step < options.length; step += 1) {
        next = (next + delta + options.length) % options.length;
        if (!options[next]?.disabled) return next;
      }
      return current;
    });
  }

  function selectOption(option: SelectOption) {
    if (option.disabled) return;
    onValueChange(option.value);
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openListbox();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(firstEnabledIndex());
    } else if (event.key === "End") {
      event.preventDefault();
      const last = options.length - 1;
      setActiveIndex(options[last]?.disabled ? firstEnabledIndex() : last);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) selectOption(option);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    panelRef.current
      ?.querySelector<HTMLElement>(`[data-option-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, panelRef]);

  return (
    <div className={classNames("ui-field", className)}>
      <span className="ui-field__label" id={labelId}>
        {label}
      </span>
      <button
        ref={triggerRef}
        aria-activedescendant={open ? `${listboxId}-option-${activeIndex}` : undefined}
        aria-controls={listboxId}
        aria-describedby={describedBy}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={labelId}
        autoFocus={autoFocus}
        className={classNames(
          "ui-select-trigger motion-safe-transition",
          error && "ui-select-trigger--error",
        )}
        disabled={disabled}
        id={selectId}
        name={name}
        onClick={() => (open ? setOpen(false) : openListbox())}
        onKeyDown={handleKeyDown}
        role="combobox"
        type="button"
      >
        <span
          className={classNames(
            "ui-select-trigger__value",
            !selectedOption && "ui-select-trigger__value--placeholder",
          )}
        >
          {selectedOption?.label ?? placeholder ?? "Select an option"}
        </span>
        <MaterialSymbol
          className="ui-select-trigger__chevron"
          name="expand_more"
          size={20}
        />
      </button>

      <div
        aria-labelledby={labelId}
        className={classNames(
          "ui-listbox",
          !popoverSupported && "ui-listbox--fallback",
          open && "ui-listbox--open",
        )}
        id={listboxId}
        popover={popoverSupported ? "manual" : undefined}
        ref={panelRef}
        role="listbox"
      >
        {options.map((option, index) => {
          const selected = option.value === value;
          return (
            <div
              aria-disabled={option.disabled || undefined}
              aria-selected={selected}
              className={classNames(
                "ui-listbox__option",
                index === activeIndex && "ui-listbox__option--active",
                selected && "ui-listbox__option--selected",
              )}
              data-option-index={index}
              id={`${listboxId}-option-${index}`}
              key={option.value}
              onClick={() => selectOption(option)}
              onMouseEnter={() => {
                if (!option.disabled) setActiveIndex(index);
              }}
              role="option"
            >
              <span>{option.label}</span>
              {selected ? <MaterialSymbol name="check" size={20} /> : null}
            </div>
          );
        })}
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
}
