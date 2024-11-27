import { Menu } from "~/components/artefact-creator";
import { Block, BlockContext, breakpoints, Settings } from "~/components/blocks";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "~/components/ui/context-menu";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useLocalStorage } from 'usehooks-ts'
import { cn } from "~/lib/utils";
import { Navigation } from "~/components/layouts/navigation";
import { redirect, useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { database, WebsiteData } from "~/db.server";
import { getSession } from "~/session.server";
import { SortableItem } from "~/components/sortable-item";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { slug } = params;

  if (!slug) {
    return redirect('/builder/new');
  }

  const pb = database;

  try {
    const session = await getSession(request);
    const website = await pb.collection('websites').getOne<WebsiteData>(slug);

    if (website.created_by !== session.data.id) {
      return redirect('/unauthorized');
    }

    return {
      status: 200,
      message: `Website found`,
      data: website,
    };
  
  } catch(e) {
    return redirect('/builder/new');
  }
}

function moveFromTo<A>(array: A[], from: number, to: number) {
  const newArray = [...array];
  const [removed] = newArray.splice(from, 1);
  newArray.splice(to, 0, removed);

  return newArray;
}

export default function BuilderIndex() {
  const loaderData = useLoaderData<typeof loader>();

  const [blocks, setBlocks] = useLocalStorage<Block[]>(`blocks-${loaderData.data.id}`, loaderData.data.content.blocks);
  const [settings, setSettings] = useLocalStorage<Settings>(`settings-${loaderData.data.id}`, loaderData.data.content.settings);

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

        return moveFromTo(blocks, oldIndex, newIndex);
      });
    }
  }

  return <div className="bg-slate-100 min-h-screen">
    <BlockContext.Provider value={{ blocks, setBlocks }}>
      <Navigation published={loaderData.data.published} name={loaderData.data.id} setBlocks={setBlocks} setSettings={setSettings} settings={settings} action="preview" />
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