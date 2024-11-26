import type { MetaFunction } from "@remix-run/node";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { breakpoints } from "~/components/blocks";
import { PreviewBlock } from "~/components/render";
import { Button } from "~/components/ui/button";
import { createSupabaseServerClient, WebsiteData } from "~/lib/supabase";
import { cn } from "~/lib/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabaseClient, headers } = createSupabaseServerClient(request);

  const url = new URL(request.url);
  const subdomains = url.hostname.split(".");

  if (subdomains.length < 3) {
    return { status: 200, message: 'No website found.', data: null };
  }

  const subdomain = subdomains[0];

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

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.data?.content) {
    const description = "is-a.bio is the best app to create your portfolio. Start building your portfolio today with is-a.bio.";

    return [
      { title: 'is-a.bio' },
      {
        property: "og:title",
        content: "is-a.bio",
      },
      {
        name: "description",
        content: description,
      },
      {
        property: "og:description",
        content: description,
      },
    ]
  }

  const { settings } = data.data.content;

  return [
    { title: settings.title },
    {
      property: "og:title",
      content: settings.title,
    },
    {
      name: "description",
      content: settings.description,
    },
    {
      property: "og:description",
      content: settings.description,
    },
  ]
}

function MainPage() {
  return <main className="bg-slate-100 min-h-screen">
    <nav className="py-16 max-w-7xl mx-auto w-full grid grid-cols-4">
      <span className="relative inline-flex max-md:justify-center mx-auto py-2 px-4 bg-primary text-primary-foreground w-max rounded-lg font-black">
        is-a.bio
      </span>

      <div className="col-span-3 justify-self-end gap-x-2 flex flex-row items-center">
        <Button variant="outline">
          Login to your account
        </Button>

        <Button>
          Start building your website
        </Button>
      </div>
    </nav>

    <div className="max-w-2xl mx-auto w-full text-center mt-32">
      <h1 className="text-5xl font-bold text-primary">
        Create your next-level portfolio
      </h1>

      <p className="py-8 text-xl text-muted-foreground">
        Start building your portfolio today with is-a.bio. Showcase your work, your projects, and your skills to the world.
      </p>

      <Button>
        Get started for free
      </Button>
    </div>

  </main>
}

export default function Index() {
  const { data } = useLoaderData<typeof loader>();

  if (!data || !data.content) {
    return <MainPage />
  }
  
  const { settings, blocks } = data.content;
  return <div className={cn("mx-auto w-full py-32 px-4", breakpoints[settings.size])}>
    {blocks.map((block, index) => <PreviewBlock key={index} block={block} />)}
  </div>
}
