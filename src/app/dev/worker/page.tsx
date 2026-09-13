import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout";
import { WorkerDiagnostic } from "@/features/foundation/worker-diagnostic";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Worker diagnostic | CompressByURL",
};

export default function WorkerDiagnosticPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="worker-diagnostic-page">
      <Container size="content">
        <WorkerDiagnostic />
      </Container>
    </main>
  );
}
