import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { MoveCard } from "@/components/MoveCard";
import { Button } from "@/components/ui/button";
import type { Move } from "@/types/repeater";

type SortableMoveListProps = {
  moves: Move[];
  expandedMoveIds: Set<string>;
  activeMoveId?: string;
  onExpandedChange: (moveId: string, expanded: boolean) => void;
  onChange: (move: Move) => void;
  onDelete: (moveId: string) => void;
  onReorder: (orderedMoveIds: string[]) => void;
  pendingMoveIds?: Set<string>;
  moveSaveErrors?: Record<string, string>;
  reordering?: boolean;
  onFlush?: (moveId: string) => Promise<void>;
  onRetry?: (moveId: string) => Promise<void>;
};

export function getReorderedMoveIds(ids: string[], activeId: string, overId: string): string[] {
  const oldIndex = ids.indexOf(activeId);
  const newIndex = ids.indexOf(overId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return ids;
  return arrayMove(ids, oldIndex, newIndex);
}

/** Provides pointer, touch, and keyboard sorting for the active style's moves. */
export function SortableMoveList({
  moves,
  expandedMoveIds,
  activeMoveId,
  onExpandedChange,
  onChange,
  onDelete,
  onReorder,
  pendingMoveIds = new Set(),
  moveSaveErrors = {},
  reordering = false,
  onFlush,
  onRetry,
}: SortableMoveListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = moves.map((move) => move.id);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    onReorder(getReorderedMoveIds(ids, String(active.id), String(over.id)));
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    onExpandedChange(String(active.id), false);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-3" aria-label="Moves">
          {moves.map((move) => (
            <SortableMove
              key={move.id}
              move={move}
              expanded={expandedMoveIds.has(move.id)}
              active={move.id === activeMoveId}
              onExpandedChange={(expanded) => onExpandedChange(move.id, expanded)}
              onChange={onChange}
              onDelete={() => onDelete(move.id)}
              saving={pendingMoveIds.has(move.id)}
              saveError={moveSaveErrors[move.id]}
              disabled={reordering}
              onFlush={() => void onFlush?.(move.id)}
              onRetry={() => void onRetry?.(move.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableMove({
  move,
  expanded,
  active,
  onExpandedChange,
  onChange,
  onDelete,
  saving,
  saveError,
  disabled,
  onFlush,
  onRetry,
}: {
  move: Move;
  expanded: boolean;
  active: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onChange: (move: Move) => void;
  onDelete: () => void;
  saving: boolean;
  saveError?: string;
  disabled: boolean;
  onFlush: () => void;
  onRetry: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: move.id, disabled });

  return (
    <div
      ref={setNodeRef}
      className={isDragging ? "relative z-20 opacity-70" : undefined}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <MoveCard
        move={move}
        expanded={expanded}
        active={active}
        onExpandedChange={onExpandedChange}
        onChange={onChange}
        onDelete={onDelete}
        saving={saving}
        saveError={saveError}
        onFlush={onFlush}
        onRetry={onRetry}
        dragHandle={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
            aria-label={`Reorder ${move.name.trim() || "untitled move"}`}
            disabled={disabled}
            {...attributes}
            {...listeners}
          >
            <GripVertical />
          </Button>
        }
      />
    </div>
  );
}
