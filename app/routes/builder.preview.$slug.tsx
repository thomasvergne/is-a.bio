import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { MessageCircleWarning } from "lucide-react";
import { ClientResponseError } from "pocketbase";
import { useState } from "react";
import { Block, breakpoints, Settings } from "~/components/blocks";
import { Navigation } from "~/components/layouts/navigation";
import { PreviewBlock } from "~/components/render";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { database, WebsiteData } from "~/db.server";
import { cn } from "~/lib/utils";
import { fetchUser, getSession } from "~/session.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();

  const blocks = JSON.parse(formData.get('blocks') as string) as Block[];
  const settings = JSON.parse(formData.get('settings') as string) as Settings;
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

    await pb.collection('websites').update<WebsiteData>(slug, {
      content: {
        blocks,
        settings,
      }
    });

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
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const [blocks, setBlocks] = useState<Block[]>(data.data.content.blocks);
  const [settings, setSettings] = useState<Settings>(data.data.content.settings as Settings);

  return <main className="min-h-screen bg-slate-100">
    <Navigation 
      published={data.data.published} name={data.data.id} 
      settings={settings} setBlocks={setBlocks} setSettings={setSettings} 
      action="edit" 
      onSave={() => {
        const formData = new FormData();
        formData.append('blocks', JSON.stringify(blocks));
        formData.append('settings', JSON.stringify(settings));
        
        submit(formData, {
          method: 'post',
          encType: 'multipart/form-data',
        });
      }}
    />

    <div className={cn("mx-auto w-full py-32 px-4", breakpoints[settings.size])}>
      {actionData?.message && (
        <Alert variant="destructive">
          <MessageCircleWarning className="w-5 h-5 mr-2" />

          <AlertTitle>
            An error occured while saving the portfolio
          </AlertTitle>
          <AlertDescription>
            {actionData.message}
          </AlertDescription>
        </Alert>
      )}
      {blocks.map((block, index) => <PreviewBlock key={index} block={block} />)}
    </div>
  </main>;
}