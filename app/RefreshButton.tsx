"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Tooltip>
      <TooltipTrigger
        disabled={isPending}
        onClick={() => startTransition(() => router.refresh())}
        className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 transition-colors"
        aria-label="Refresh connection status"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
      </TooltipTrigger>
      <TooltipContent>Refresh connection status</TooltipContent>
    </Tooltip>
  );
}
