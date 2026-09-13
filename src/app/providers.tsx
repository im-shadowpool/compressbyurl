"use client";

import type { ReactNode } from "react";

import { ToastProvider } from "@/components/ui";
import { ServiceWorkerRegistration } from "@/features/pwa";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ServiceWorkerRegistration />
      {children}
    </ToastProvider>
  );
}
