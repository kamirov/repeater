import { Menu } from "lucide-react";
import { useState } from "react";

import { Brand, StyleNavigation } from "@/components/StyleNavigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { DanceStyle } from "@/types/repeater";

type MobileNavigationProps = {
  styles: DanceStyle[];
  activeStyleId: string | null;
  onCreate: (name: string) => void;
  onRename: (styleId: string, name: string) => void;
  onDelete: (styleId: string) => void;
  onSelect: (styleId: string) => void;
};

/** Adapts the style library into a compact mobile sheet. */
export function MobileNavigation(props: MobileNavigationProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur-xl lg:hidden">
      <Brand />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Open style navigation">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle className="sr-only">Dance styles</SheetTitle>
          <SheetDescription className="sr-only">Choose and manage your dance styles.</SheetDescription>
          <StyleNavigation {...props} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
