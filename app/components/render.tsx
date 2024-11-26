import { marked } from "marked";
import { Block, gridSizes } from "./blocks";
import { cn } from "~/lib/utils";

export function PreviewBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'image': {
      const { url, alt } = block;

      return <img
        src={url}
        alt={alt}
        className="w-full h-96 object-cover my-8"
      />;
    }

    case 'text': {
      const { content } = block;

      return <div className="prose my-2" dangerouslySetInnerHTML={{ __html: marked(content) }} />;
    }

    case 'grid': {
      const { children, size } = block;
      return <div className={cn("grid gap-4 my-4", size in gridSizes ? gridSizes[size] : 'col-span-1')}>
        {children.map((child, index) => <PreviewBlock key={index} block={child} />)}
      </div>;
    }
  }
}