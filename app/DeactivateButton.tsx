"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeactivateButton({ triggerName }: { triggerName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDeactivate() {
    setLoading(true);
    try {
      const res = await fetch("/api/activate", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: triggerName }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Deactivation failed");
      toast.success("Bot deactivated.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleDeactivate}
      disabled={loading}
      className="w-full text-xs text-muted-foreground hover:text-destructive"
    >
      {loading ? "Deactivating…" : "Deactivate"}
    </Button>
  );
}
