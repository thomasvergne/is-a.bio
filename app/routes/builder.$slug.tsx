import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { BlockContext } from "~/components/blocks";
import { Block } from "~/components/types";
import { database, WebsiteData } from "~/db.server";
import { getSession } from "~/session.server";

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

export default function RootLayout() {
  const loaderData = useLoaderData<typeof loader>();

  const [blocks, setBlocks] = useState<Block[]>(loaderData.data.content.blocks);

  return <BlockContext.Provider value={{ blocks, setBlocks }}>
    <Outlet />
  </BlockContext.Provider>
}