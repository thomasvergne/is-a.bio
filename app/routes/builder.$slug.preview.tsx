import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, useActionData, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { ClientResponseError } from "pocketbase";
import { useState } from "react";
import { Block, breakpoints, Settings } from "~/components/blocks";
import { Navigation } from "~/components/layouts/navigation";
import { PreviewBlock } from "~/components/render";
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

    return redirect(`/builder/${slug}/preview`);
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
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigate = useNavigate();

  const [blocks, setBlocks] = useState<Block[]>(loaderData.data.content.blocks);
  const [settings, setSettings] = useState<Settings>(loaderData.data.content.settings as Settings);

  return <div className="max-w-5xl mx-auto w-full">
    <Navigation
      published={loaderData.data.published} 
      name={loaderData.data.id}
      setBlocks={setBlocks} setSettings={setSettings} 
      settings={settings} action="edit" 
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

    <div className={cn("mx-auto w-full py-16 px-4", breakpoints[settings.size])}>
      {blocks.map((block, index) => <PreviewBlock key={index} block={block} />)}
    </div>
  </div>;
}