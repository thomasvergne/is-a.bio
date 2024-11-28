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

    const faviconURL = await pb.files.getURL(website, website.favicon);
    const websiteWithURL = {
      ...website,
      favicon: faviconURL,
    }

    return {
      status: 200,
      message: `Website found`,
      data: websiteWithURL,
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

      { tagName: "link", rel: 'icon', href: '/favicon.png', type: 'image/png' }
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
    { tagName: "link", rel: 'icon', href: data.data.favicon, type: 'image/png' }

  ]
}

type Unpromise<T> = T extends Promise<infer U> ? U : T;

function MainPage({ data }: { data: Unpromise<ReturnType<typeof loader>> }) {
  return <main className="bg-slate-100 min-h-screen">
    <MainNavigation user={data.user} />

    <header className="max-w-2xl mx-auto w-full text-center mt-24">
      <h1 className="text-5xl font-bold text-foreground">
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
    </header>
    
    <div className="relative">
      <img src="/screenshot.png" className="max-w-3xl 2xl:max-w-7xl xl:max-w-5xl mt-16 mx-auto border rounded-lg" alt="" />

      <div className="absolute bottom-0 h-2/3 w-full bg-gradient-to-t from-slate-100 to-transparent">

      </div>
    </div>
  </main>
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  if (!data || !data.data) {
    return <MainPage data={data} />
  }
  
  const { settings, blocks } = data.data.content;

  return <>
    <div className={cn("w-full min-h-screen bg-slate-100 flex flex-col")}>
      <div className={cn("flex-grow py-32 px-4 mx-auto w-full", breakpoints[settings.size])}>
        {blocks.map((block, index) => <PreviewBlock key={index} block={block} />)}
      </div>
      
      <p className="bg-white text-sm text-center w-full relative border-t border-slate-200 py-2">
        Made with <Link className="hover:underline" to="https://is-a.bio">is-a.bio</Link>
      </p>
    </div>
  </>
}
