import type { MetaFunction } from "@remix-run/node";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { breakpoints } from "~/components/blocks";
import { MainNavigation } from "~/components/layouts/navigation";
import { PreviewBlock } from "~/components/render";
import { Button } from "~/components/ui/button";
import { database, WebsiteData } from "~/db.server";
import { cn } from "~/lib/utils";
import { fetchUser } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const pb = database;
  const session = await fetchUser(request);
  const url = new URL(request.url);

  // Getting the subdomain from the URL
  const subdomains = url.hostname.split(".");

  if (subdomains.length < 3) {
    return { status: 200, message: 'No website found.', data: null, user: session };
  }

  const subdomain = subdomains[0];

  try {
    const website = await pb.collection('websites').getOne<WebsiteData>(subdomain);
    
    if (!website.published) {
      return { status: 200, message: 'No website found.', data: null, user: session };
    }

    return {
      status: 200,
      message: `Website found`,
      data: website,
      user: session,
    };
  } catch(e) {
    return { status: 200, message: 'No website found.', data: null, user: session };
  }
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

type Unpromise<T> = T extends Promise<infer U> ? U : T;

function MainPage({ data }: { data: Unpromise<ReturnType<typeof loader>> }) {
  return <main className="bg-slate-100 min-h-screen">
    <MainNavigation user={data.user} />

    <div className="max-w-2xl mx-auto w-full text-center mt-32">
      <h1 className="text-5xl font-bold text-primary">
        Create your next-level portfolio
      </h1>

      <p className="py-8 text-xl text-muted-foreground">
        Start building your portfolio today with is-a.bio. Showcase your work, your projects, and your skills to the world.
      </p>

      <Button asChild>
        <Link to="/builder/new">
          Get started for free
        </Link>
      </Button>
    </div>

  </main>
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  if (!data || !data.data) {
    return <MainPage data={data} />
  }
  
  const { settings, blocks } = data.data.content;
  return <div className={cn("mx-auto w-full py-32 px-4", breakpoints[settings.size])}>
    {blocks.map((block, index) => <PreviewBlock key={index} block={block} />)}
  </div>
}
