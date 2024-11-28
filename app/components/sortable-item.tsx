import { useSortable } from "@dnd-kit/sortable";
import { Block, RenderBlock } from "./blocks";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export function SortableItem({ block, index, id }: { block: Block, index: number, id: string }) {
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

  return <div ref={setNodeRef} style={style} className="grid grid-cols-12 my-2">
    <div className="col-span-11">
      <RenderBlock block={block} index={index} />
    </div>

    <div className="justify-self-end">
    <GripVertical className="h-6 w-6 ml-2 col-span-1" {...attributes} {...listeners} />
    </div>
  </div>
}