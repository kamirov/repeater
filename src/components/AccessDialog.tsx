import { KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccessDialog({
  open,
  error,
  onSubmit,
}: {
  open: boolean;
  error: string | null;
  onSubmit: (secret: string) => Promise<boolean>;
}) {
  const [secret, setSecret] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <div className="mb-1 grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary"><KeyRound /></div>
          <DialogTitle>Enter the secret word</DialogTitle>
          <DialogDescription>Repeater needs the shared secret before it can load or save your dance library.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!secret.trim() || submitting) return;
            setSubmitting(true);
            const accepted = await onSubmit(secret);
            setSubmitting(false);
            if (!accepted) setSecret("");
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="repeater-secret">Secret word</Label>
            <Input
              id="repeater-secret"
              type="password"
              autoFocus
              autoComplete="current-password"
              value={secret}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "repeater-secret-error" : undefined}
              onChange={(event) => setSecret(event.target.value)}
            />
            {error ? <p id="repeater-secret-error" className="text-sm font-medium text-destructive">{error}</p> : null}
          </div>
          <Button type="submit" className="w-full" disabled={!secret.trim() || submitting}>
            {submitting ? <><Loader2 className="animate-spin" /> Checking…</> : "Unlock Repeater"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
