"use client";

import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";

import { MaterialSymbol } from "@/components/icons";
import { IconButton } from "@/components/ui/icon-button";
import { classNames } from "@/lib/class-names";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Dialog({
  children,
  className,
  description,
  footer,
  onOpenChange,
  open,
  title,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function close() {
    onOpenChange(false);
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) close();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className="ui-dialog"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={handleBackdropClick}
      onClose={() => onOpenChange(false)}
    >
      <div className={classNames("ui-dialog__surface", className)}>
        <div className="ui-dialog__header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description ? <p id={descriptionId}>{description}</p> : null}
          </div>
          <IconButton
            icon={<MaterialSymbol name="close" />}
            label="Close dialog"
            onClick={close}
          />
        </div>
        <div className="ui-dialog__body">{children}</div>
        {footer ? <div className="ui-dialog__footer">{footer}</div> : null}
      </div>
    </dialog>
  );
}
