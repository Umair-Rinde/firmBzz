"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { Drawer as VaulDrawer } from "vaul";

/** Keeps pixel/rem drawers inside the viewport on narrow screens. */
function capWidthToViewport(width: string): string {
  const t = width.trim();
  if (t.includes("min(") || t.includes("max(") || t.includes("clamp(")) {
    return t;
  }
  const m = /^(\d+(?:\.\d+)?)(px|rem)$/.exec(t);
  if (m) return `min(100vw, ${m[1]}${m[2]})`;
  return t;
}

export function Drawer({
  children,
  open,
  onOpenChange,
  width,
}: {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  width?: string;
}) {
  return (
    <VaulDrawer.Root
      direction="right"
      open={open}
      onOpenChange={onOpenChange}
      dismissible={false}
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <VaulDrawer.Content
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          style={width ? { width: capWidthToViewport(width) } : undefined}
          className={cn(
            "fixed top-0 right-0 h-full max-w-[100vw] min-w-0 w-[min(100vw,300px)] bg-white shadow-lg z-50 flex flex-col outline-none",
            "transition-transform duration-300 ease-in-out"
          )}
        >
          {children}
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}

export const DrawerTrigger = VaulDrawer.Trigger;
export const DrawerClose = VaulDrawer.Close;
