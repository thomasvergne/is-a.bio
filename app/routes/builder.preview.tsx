import { useLocalStorage } from "usehooks-ts";
import { Block, breakpoints, Settings } from "~/components/blocks";
import { Navigation } from "~/components/layouts/navigation";
import { PreviewBlock } from "~/components/render";
import { cn } from "~/lib/utils";


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