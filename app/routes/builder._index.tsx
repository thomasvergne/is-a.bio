import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { MainNavigation } from "~/components/layouts/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { database, WebsiteData } from "~/db.server";
import { fetchUser } from "~/session.server";

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

    return {
      status: 200,
      message: 'Websites found',
      data: websites,
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

  return <main className="min-h-screen bg-slate-100">
    <MainNavigation user={data.user} />

    <div className="grid grid-cols-3 gap-8 max-w-7xl mx-auto py-64">
      <div className="col-span-3">
        <h1 className="text-4xl font-bold">
          Your websites
        </h1>

        <p className="text-lg text-muted-foreground mt-2">
          Here are all the websites you have created with is-a.bio.
        </p>
      </div>

      {data.data.map((website, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>
              {website.content.settings.title}
            </CardTitle>

            <CardDescription>
              {website.content.settings.description}
            </CardDescription>
          </CardHeader>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link to={`/builder/${website.id}`}>
                Edit and publish
              </Link>
            </Button>

            <Button asChild>
              <Link to={`https://${website.id}.is-a.bio`}>
                Visualize website
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  </main>
}