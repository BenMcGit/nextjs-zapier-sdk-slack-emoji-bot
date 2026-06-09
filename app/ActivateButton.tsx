"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ActivateButton({ triggerName }: { triggerName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleActivate() {
    setLoading(true);
    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: triggerName }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Activation failed");
      toast.success("Bot activated successfully.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleActivate}
      disabled={loading}
      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
    >
      {loading ? "Activating…" : "Activate"}
    </Button>
  );
}
