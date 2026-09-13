"use client";

import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";

import { MaterialSymbol } from "@/components/icons";
import { IconButton } from "@/components/ui/icon-button";
import { classNames } from "@/lib/class-names";

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: "right" | "bottom";
}

export function Sheet({
  children,
  description,
  footer,
  onOpenChange,
  open,
  side = "right",
  title,
}: SheetProps) {
  const sheetRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    if (open && !sheet.open) sheet.showModal();
    if (!open && sheet.open) sheet.close();
  }, [open]);

  function close() {
    onOpenChange(false);
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) close();
  }

  return (
    <dialog
      ref={sheetRef}
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={classNames("ui-sheet", `ui-sheet--${side}`)}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={handleBackdropClick}
      onClose={() => onOpenChange(false)}
    >
      <div className="ui-sheet__surface">
        <div className="ui-sheet__header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description ? <p id={descriptionId}>{description}</p> : null}
          </div>
          <IconButton
            icon={<MaterialSymbol name="close" />}
            label="Close sheet"
            onClick={close}
          />
        </div>
        <div className="ui-sheet__body">{children}</div>
        {footer ? <div className="ui-sheet__footer">{footer}</div> : null}
      </div>
    </dialog>
  );
}
