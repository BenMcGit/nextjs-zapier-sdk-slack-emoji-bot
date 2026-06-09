"use client";

import { Wrench } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function ManageConnectionsButton() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <a
            href="https://zapier.com/app/connections"
            target="_blank"
            rel="noreferrer"
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Manage connections"
          >
            <Wrench className="h-3.5 w-3.5" />
          </a>
        }
      />
      <TooltipContent>Manage connections at zapier.com</TooltipContent>
    </Tooltip>
  );
}
