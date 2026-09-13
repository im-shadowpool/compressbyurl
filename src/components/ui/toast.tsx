"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { MaterialSymbol } from "@/components/icons";
import { IconButton } from "@/components/ui/icon-button";
import { classNames } from "@/lib/class-names";

export type ToastVariant = "info" | "success" | "warning" | "error";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => number;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastIcons: Record<ToastVariant, string> = {
  info: "info",
  success: "check_circle",
  warning: "warning",
  error: "error",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismissToast = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      nextId.current += 1;
      const id = nextId.current;
      const duration = options.duration ?? 4200;

      setToasts((current) => [
        ...current,
        { ...options, id, variant: options.variant ?? "info" },
      ]);

      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismissToast(id), duration),
        );
      }

      return id;
    },
    [dismissToast],
  );

  useEffect(() => {
    const activeTimers = timers.current;
    return () => activeTimers.forEach((timer) => clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ dismissToast, showToast }), [dismissToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="ui-toast-viewport" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <div
            className={classNames("ui-toast", `ui-toast--${toast.variant}`)}
            key={toast.id}
            role={toast.variant === "error" ? "alert" : "status"}
          >
            <MaterialSymbol name={toastIcons[toast.variant]} />
            <div className="ui-toast__content">
              <strong>{toast.title}</strong>
              {toast.description ? <p>{toast.description}</p> : null}
            </div>
            <IconButton
              icon={<MaterialSymbol name="close" size={20} />}
              label="Dismiss notification"
              onClick={() => dismissToast(toast.id)}
              size="small"
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider.");
  return context;
}
