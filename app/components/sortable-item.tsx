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

  return <div ref={setNodeRef} style={style} className="flex flex-row my-2">
    <RenderBlock block={block} index={index} />

    <GripVertical className="h-6 w-6 ml-2" {...attributes} {...listeners} />
  </div>
}