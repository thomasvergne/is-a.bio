import { LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { database, WebsiteData } from "~/db.server";
import { fetchUser } from "~/session.server";

export const meta: MetaFunction = () => {
  const description = "is-a.bio is the best app to create your portfolio. Start building your portfolio today with is-a.bio.";

  return [
    { title: 'Websites | is-a.bio' },
    {
      property: "og:title",
      content: "Websites | is-a.bio",
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

export async function loader({ request }: LoaderFunctionArgs) {
  const pb = database;
  const session = await fetchUser(request);

  if (!session) {
    return redirect('/login');
  }

  try {
    const websites = await pb.collection('websites').getFullList<WebsiteData>({
      filter: `created_by = "${session.id}"`
    });

    const newWebsitesWithURL = await Promise.all(websites.map(async website => {
      const url = await pb.files.getURL(website, website.favicon);

      return {
        ...website,
        favicon: url,
      };
    }));

    return {
      status: 200,
      message: 'Websites found',
      data: newWebsitesWithURL,
      user: session,
    };
  } catch(e) {
    return {
      status: 200,
      message: 'No websites found',
      data: [],
      user: session,
    };
  }
}

export default function BuilderIndex() {
  const data = useLoaderData<typeof loader>();

  return <div className="grid grid-cols-2 gap-8 lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto py-32 xl:py-64">
    <div className="col-span-2">
      <h1 className="text-4xl font-bold">
        Your websites
      </h1>

      <p className="text-lg text-muted-foreground mt-2">
        Here are all the websites you have created with is-a.bio.
      </p>
    </div>

    {data.data.map((website, index) => (
      <Card key={index} className="grid xl:grid-rows-2">
        <CardHeader className="flex flex-col xl:flex-row xl:items-center gap-4 row-span-1">
          {
            website.favicon && (
              <img src={website.favicon} alt="Website favicon" className="w-12 h-12 rounded-md" />
            )
          }
          <div>
            <CardTitle>
              {website.content.settings.title}
            </CardTitle>

            <CardDescription>
              {website.content.settings.description}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardFooter className="flex max-lg:flex-col justify-end xl:justify-between xl:items-end row-span-1 gap-2">
          <Button variant="outline" className="max-xl:w-full" asChild>
            <Link to={`/builder/${website.id}`}>
              Edit and publish
            </Link>
          </Button>

          <Button asChild className="max-xl:w-full">
            <Link to={`https://${website.id}.is-a.bio`}>
              Visit website
            </Link>
          </Button>
        </CardFooter>
      </Card>
    ))}
  </div>
}