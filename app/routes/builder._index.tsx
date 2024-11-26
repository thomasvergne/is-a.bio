import { Menu } from "~/components/artefact-creator";
import { Block, BlockContext, breakpoints, RenderBlock, Settings } from "~/components/blocks";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "~/components/ui/context-menu";
import { GripVertical } from "lucide-react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLocalStorage } from 'usehooks-ts'
import { cn } from "~/lib/utils";
import { Navigation } from "~/components/layouts/navigation";

function SortableItem({ block, index, id }: { block: Block, index: number, id: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return <div ref={setNodeRef} style={style} className="flex flex-row my-2">
    <RenderBlock block={block} index={index} />

    <GripVertical className="h-6 w-6 ml-2" {...attributes} {...listeners} />
  </div>
}

export default function BuilderIndex() {
  const [blocks, setBlocks] = useLocalStorage<Block[]>("blocks", []);
  const [settings, setSettings] = useLocalStorage<Settings>("settings", { title: 'Untitled portfolio', size: 'small', description: '' });


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;
    if (!active) return;

    if (active.id !== over.id) {
      setBlocks((blocks) => {
        const oldIndex = blocks.findIndex((item) => item.id === active.id);
        const newIndex = blocks.findIndex((item) => item.id === over.id);

        return arrayMove(blocks, newIndex, oldIndex);
      });
    }
  }

  return <div className="bg-slate-100 min-h-screen">
    <BlockContext.Provider value={{ blocks, setBlocks }}>
      <Navigation setBlocks={setBlocks} setSettings={setSettings} settings={settings} action="preview" />
      <main className={cn("mx-auto w-full py-32 px-4", breakpoints[settings.size])}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((block) => block.id)}
            strategy={verticalListSortingStrategy}
          >
            {blocks.map((block, index) => <SortableItem block={block} index={index} id={block.id} key={block.id} />)}
          </SortableContext>
        </DndContext>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="h-12 w-full border border-slate-400 rounded-md border-dashed grid place-items-center text-sm text-muted-foreground my-1 mt-4">
              Right click to show context menu
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent className="w-64">
            <Menu blocks={blocks} setBlocks={setBlocks} position={blocks.length} />
          </ContextMenuContent>
        </ContextMenu>
      </main>
    </BlockContext.Provider>
  </div>
}