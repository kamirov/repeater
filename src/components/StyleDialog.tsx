import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type StyleDialogProps = {
  mode: "create" | "rename";
  initialName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (name: string) => void;
  children?: ReactNode;
};

/** Collects and validates a dance-style name for create and rename flows. */
export function StyleDialog({
  mode,
  initialName = "",
  open,
  onOpenChange,
  onSubmit,
  children,
}: StyleDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const resolvedOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setName(initialName);
    setOpen(nextOpen);
  };

  const isCreate = mode === "create";

  return (
    <Dialog open={resolvedOpen} onOpenChange={handleOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCreate ? "Add a dance style" : "Rename style"}</DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Create a home for the moves you want to practice together."
              : "Give this repertoire a name you will recognize at a glance."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) return;
            onSubmit(name.trim());
            setOpen(false);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor={`${mode}-style-name`}>Style name</Label>
            <Input
              id={`${mode}-style-name`}
              autoFocus
              autoComplete="off"
              placeholder="e.g. Salsa on 2"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {isCreate ? "Create style" : "Save name"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
