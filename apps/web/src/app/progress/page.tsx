import type { Metadata } from "next";
import { ProgressDashboard } from "@/components/progress-dashboard";

export const metadata: Metadata = {
  title: "Natijalar",
  description: "Mashq kunlari, o'zlashtirilgan so'zlar va ball dinamikasi.",
};

export default function ProgressPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Natijalar</h1>
      <p className="mt-3 max-w-[58ch] text-muted-foreground">
        Ma&apos;lumotlar faqat shu brauzerda saqlanadi. Boshqa qurilmada ochsangiz, natijalar ko&apos;rinmaydi.
      </p>
      <div className="mt-10">
        <ProgressDashboard />
      </div>
    </div>
  );
}
