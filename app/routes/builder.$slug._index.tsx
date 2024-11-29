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
import { Navigation } from "~/components/layouts/navigation";
import { redirect, useActionData, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { database, WebsiteData } from "~/db.server";
import { fetchUser, getSession } from "~/session.server";
import { SortableItem } from "~/components/sortable-item";
import { ClientResponseError } from "pocketbase";
import { useState } from "react";
import { cn } from "~/lib/utils";

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();

  const blocks = JSON.parse(formData.get('blocks') as string) as Block[];
  const settings = JSON.parse(formData.get('settings') as string) as Settings;
  const favicon = formData.get('favicon') as File | null;

  const { slug } = params;
  const pb = database;

  if (!slug) {
    return redirect('/builder/new');
  }

  try {
    const session = await fetchUser(request);

    if (!session) {
      return redirect('/login');
    }
    
    const website = await pb.collection('websites').getOne<WebsiteData>(slug);

    if (website.created_by !== session.id) {
      return redirect('/unauthorized');
    }

    const updateFormData = new FormData();
    updateFormData.append('content', JSON.stringify({ blocks, settings }));
    
    if (favicon) {
      updateFormData.append('favicon', favicon);
    }

    await pb.collection('websites').update<WebsiteData>(slug, updateFormData);
 
    return redirect(`/builder/${slug}`);
  } catch(e) {
    const error = e as ClientResponseError;

    return {
      status: 500,
      message: error.message,
    }
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { slug } = params;

  if (!slug) {
    return redirect('/builder/new');
  }

  const pb = database;

  try {
    const session = await getSession(request);

    if (!session) {
      return redirect('/login');
    }

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
  const actionData = useActionData<typeof action>();

  const [blocks, setBlocks] = useState<Block[]>(loaderData.data.content.blocks);
  const [settings, setSettings] = useState<Settings>(loaderData.data.content.settings as Settings);
  const submit = useSubmit();
  const navigate = useNavigate();

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

  return <div className={"mx-auto w-full"}>
    <Navigation
      published={loaderData.data.published} 
      name={loaderData.data.id}
      setBlocks={setBlocks} setSettings={setSettings} 
      settings={settings} action="preview" 
      onSave={() => {
        const formData = new FormData();
        formData.append('blocks', JSON.stringify(blocks));
        formData.append('settings', JSON.stringify(settings));

        if (settings.favicon && settings.favicon instanceof File) {
          formData.append('favicon', settings.favicon);
        }
        
        submit(formData, {
          method: 'post',
          encType: 'multipart/form-data',
        });
      }}

      onDelete={() => navigate(`/builder/${loaderData.data.id}/delete`)}
      actionData={actionData}
    />

    <div className={cn("mx-auto", breakpoints[settings.size])}>
      <BlockContext.Provider value={{ blocks, setBlocks }}>
        <DndContext
          id="draggable-table-01"
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
      </BlockContext.Provider>
    </div>
  </div>
}