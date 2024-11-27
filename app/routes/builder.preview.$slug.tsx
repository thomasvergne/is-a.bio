import { LoaderFunctionArgs } from "@remix-run/node";
import { redirect, useLoaderData } from "@remix-run/react";
import { useLocalStorage } from "usehooks-ts";
import { Block, breakpoints, Settings } from "~/components/blocks";
import { Navigation } from "~/components/layouts/navigation";
import { PreviewBlock } from "~/components/render";
import { database, WebsiteData } from "~/db.server";
import { cn } from "~/lib/utils";
import { getSession } from "~/session.server";

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

export default function BuilderPreview() {
  const data = useLoaderData<typeof loader>();

  const [blocks, setBlocks] = useLocalStorage<Block[]>(`blocks-${data.data.id}`, data.data.content.blocks);
  const [settings, setSettings] = useLocalStorage<Settings>(`settings-${data.data.id}`, data.data.content.settings);

  return <main className="min-h-screen bg-slate-100">
    <Navigation published={data.data.published} name={data.data.id} settings={settings} setBlocks={setBlocks} setSettings={setSettings} action="edit" />

    <div className={cn("mx-auto w-full py-32 px-4", breakpoints[settings.size])}>
      {blocks.map((block, index) => <PreviewBlock key={index} block={block} />)}
    </div>
  </main>;
}