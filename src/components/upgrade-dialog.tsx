"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, X } from "lucide-react";

export function UpgradeDialog({ trigger }: { trigger?: React.ReactNode }) {
  const startCheckout = async (tier: "premium" | "pro") => {
    const formData = new FormData();
    formData.append("tier", tier);
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      body: formData
    });
    if (res.ok) {
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {trigger ?? <Button>Ontgrendel onbeperkt scrollen</Button>}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-background p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="text-lg font-semibold">Premium ontgrendelt onbeperkt spelen.</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-4 space-y-2 text-sm text-white/60">
            <p>Free: 10 kaarten/dag. Premium (€2,99) geeft onbeperkt + Create.</p>
            <p>Pro (€4,99) voegt team rooms en thema filters toe.</p>
          </Dialog.Description>
          <div className="mt-6 space-y-3">
            <Button className="w-full justify-between" onClick={() => startCheckout("premium")}>
              Upgrade naar Premium
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between" onClick={() => startCheckout("pro")}>
              Kies Pro
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
