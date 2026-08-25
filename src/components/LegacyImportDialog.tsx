import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { RepeaterDataV1 } from "@/types/repeater";

export function LegacyImportDialog({
  data,
  importing,
  onImport,
  onDismiss,
}: {
  data: RepeaterDataV1 | null;
  importing: boolean;
  onImport: () => Promise<void>;
  onDismiss: () => void;
}) {
  const moveCount = data?.styles.reduce((total, style) => total + style.moves.length, 0) ?? 0;
  return (
    <Dialog open={Boolean(data)}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <div className="mb-1 grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary"><Download /></div>
          <DialogTitle>Import this browser’s library?</DialogTitle>
          <DialogDescription>
            Found {data?.styles.length ?? 0} dance styles and {moveCount} moves saved locally, with a {data?.delaySeconds ?? 5}-second delay.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled={importing} onClick={onDismiss}>Start fresh</Button>
          <Button disabled={importing} onClick={() => void onImport()}>
            {importing ? <><Loader2 className="animate-spin" /> Importing…</> : "Import library"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
