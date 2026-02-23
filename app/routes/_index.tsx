import { useState, useCallback, useEffect } from "react";
import { redirect, useFetcher } from "react-router";
import { UserButton } from "@clerk/react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SuggestionCard } from "../components/SuggestionCard";
import { AddSuggestionModal } from "../components/AddSuggestionModal";
import { EditSuggestionModal } from "../components/EditSuggestionModal";
import { getAllSuggestions, type Suggestion } from "../lib/db.server";
import type { Route } from "./+types/_index";

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);
  if (!userId) throw redirect("/sign-in");
  const suggestions = await getAllSuggestions(userId);
  return { suggestions };
}

function SortableCard({
  suggestion,
  onEdit,
}: {
  suggestion: Suggestion;
  onEdit: (s: Suggestion) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: suggestion.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SuggestionCard
        suggestion={suggestion}
        onEdit={onEdit}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { suggestions } = loaderData;
  const [addOpen, setAddOpen] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<Suggestion | null>(null);
  const [items, setItems] = useState(suggestions);
  const reorderFetcher = useFetcher();

  // Keep local list in sync when loader refreshes (e.g. after add/delete)
  useEffect(() => {
    setItems(suggestions);
  }, [suggestions]);

  const closeAdd = useCallback(() => setAddOpen(false), []);
  const closeEdit = useCallback(() => setEditingSuggestion(null), []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((s) => s.id === active.id);
    const newIndex = items.findIndex((s) => s.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);

    setItems(newItems);
    reorderFetcher.submit(
      { ids: JSON.stringify(newItems.map((s) => s.id)) },
      { method: "post", action: "/suggestions/reorder" }
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">
            <span className="text-blue-600">Crush</span>Saver
          </h1>
          <UserButton />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-xl mx-auto px-4 py-6">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">💝</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Your list is empty
            </h2>
            <p className="text-gray-400 text-sm">
              Save Facebook profiles you want to remember.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {items.map((s) => (
                  <SortableCard key={s.id} suggestion={s} onEdit={setEditingSuggestion} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>

      {/* Floating Add button */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full px-5 py-3 shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 text-sm font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Facebook profile
      </button>

      <AddSuggestionModal isOpen={addOpen} onClose={closeAdd} />
      <EditSuggestionModal suggestion={editingSuggestion} onClose={closeEdit} />
    </div>
  );
}
