import { Label } from "@radix-ui/react-label";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, redirect, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { database, WebsiteData } from "~/db.server";
import { fetchUser, getSession } from "~/session.server";

export async function action({ request, params }: ActionFunctionArgs) {
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
      published: true,
    });

    return redirect(`/builder/${slug}`);
  } catch(e) {
    return redirect(`/auth/refresh?redirect=/builder/${slug}/publish`);
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

export default function BuilderPublish() {
  const loaderData = useLoaderData<typeof loader>();

  return <main className="min-h-screen bg-slate-100 grid place-items-center">
    <Form method='POST' className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">
            Publish your portfolio
          </CardTitle>

          <CardDescription>
             Finish up by verifying the details of your portfolio before publishing it.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>
              The portfolio name
            </Label>

            <p className="text-sm text-muted-foreground">
              {loaderData.data.content.settings.title}
            </p>
          </div>

          <div>
            <Label>
              The portfolio description
            </Label>

            <p className="text-sm text-muted-foreground">
              {loaderData.data.content.settings.description}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" type="reset" asChild>
            <Link to={`/builder/${loaderData.data.id}`}>
              Cancel
            </Link>
          </Button>
          <Button type="submit">Publish your portfolio</Button>
        </CardFooter>
      </Card>
    </Form>
  </main>;
}