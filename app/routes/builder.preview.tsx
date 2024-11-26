import { marked } from "marked";
import { useLocalStorage } from "usehooks-ts";
import { Block, breakpoints, gridSizes, Settings } from "~/components/blocks";
import { Navigation } from "~/components/layouts/navigation";
import { cn } from "~/lib/utils";

function PreviewBlock({ block }: { block: Block }) {
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

export default function BuilderPreview() {
  const [blocks, setBlocks] = useLocalStorage<Block[]>("blocks", []);
  const [settings, setSettings] = useLocalStorage<Settings>("settings", { title: 'Untitled portfolio', size: 'small', description: '' });
 
  return <main className="min-h-screen bg-slate-100">
    <Navigation settings={settings} setBlocks={setBlocks} setSettings={setSettings} action="edit" />

    <div className={cn("mx-auto w-full py-32 px-4", breakpoints[settings.size])}>
      {blocks.map((block, index) => <PreviewBlock key={index} block={block} />)}
    </div>
  </main>;
}