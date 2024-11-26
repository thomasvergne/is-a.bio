import type { MetaFunction } from "@remix-run/node";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { breakpoints } from "~/components/blocks";
import { PreviewBlock } from "~/components/render";
import { createSupabaseServerClient, WebsiteData } from "~/lib/supabase";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabaseClient, headers } = createSupabaseServerClient(request);

  const url = new URL(request.url);
  const subdomain = url.hostname.split(".")[0];

  const { data: website, error } = await supabaseClient.from('websites').select('*').eq('subdomain', subdomain).single();

  if (error) {
    return { status: 200, message: 'No website found.', data: null };
  }

  return {
    status: 200,
    message: `Website found: ${website?.name}`,
    data: website as WebsiteData,
    headers,
  };
}

export default function Index() {
  const { data } = useLoaderData<typeof loader>();

  if (!data || !data.content) {
    return (
      <div>
        <h1>No website found.</h1>
      </div>
    );
  }
  
  const { settings, blocks } = data.content;
  return <div className={cn("mx-auto w-full py-32 px-4", breakpoints[settings.size])}>
    {blocks.map((block, index) => <PreviewBlock key={index} block={block} />)}
  </div>
}
