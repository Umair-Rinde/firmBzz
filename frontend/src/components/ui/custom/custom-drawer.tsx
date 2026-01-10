"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { Drawer as VaulDrawer } from "vaul";

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
          style={{ width }}
          className={cn(
            "fixed top-0 right-0 h-full w-[300px] bg-white shadow-lg z-50",
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
