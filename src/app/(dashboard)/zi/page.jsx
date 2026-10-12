import ZiWorkspace from "@/components/zi/ZiWorkspace";
import { Suspense } from "react";

export const metadata = {
  title: "Zi Personal AI Tutor | PrepZii",
  description: "A dedicated PrepZii learning workspace for concept explanations, problem solving, and follow-up questions.",
};

export default function ZiPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-[#fbfaf7] dark:bg-black" />}>
      <ZiWorkspace />
    </Suspense>
  );
}
