import { ActionFunctionArgs } from "@remix-run/node";
import { Form, redirect, useActionData } from "@remix-run/react";
import { MessageCircleWarning } from "lucide-react";
import { ClientResponseError } from "pocketbase";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { database, WebsiteData } from "~/db.server";
import { fetchUser } from "~/session.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const pb = database;
  const session = await fetchUser(request);

  if (!session) {
    return redirect('/login');
  }

  const title = formData.get('portfolio-name') as string;
  const description = formData.get('portfolio-description') as string;

  try {
    const subdomain = title.toLowerCase().replace(/\s/g, '-');
    

    const website = await pb.collection('websites').create<WebsiteData>({
      id: subdomain,
      content: {
        settings: {
          title,
          description,
          size: 'small',
        },
        blocks: [],
      },
      created_by: session.id,
    });

    return redirect(`/builder/${website.id}`);
  } catch(e: unknown) {
    const error = e as ClientResponseError;
    return {
      status: 500,
      message: error.message,
    }
  }
}

export default function BuilderNew() {
  const actionData = useActionData<typeof action>();
  
  return (
    <main className="min-h-screen bg-slate-100 grid place-items-center">
      <Form method='POST' className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              Create a new portfolio
            </CardTitle>

            <CardDescription>
              Get starting by creating a new portfolio. Fill out the form below to start building your portfolio.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {actionData?.message && (
              <Alert variant="destructive">
                <MessageCircleWarning className="w-5 h-5 mr-2" />

                <AlertTitle>
                  An error occured while creating the portfolio
                </AlertTitle>
                <AlertDescription>
                  {actionData.message}
                </AlertDescription>
              </Alert>
            )}
            <div>
              <Label>
                The portfolio name
              </Label>

              <Input type="text" id="portfolio-name" name="portfolio-name" placeholder="Enter the name of your portfolio" className="mt-2" />
            </div>

            <div>
              <Label>
                The portfolio description
              </Label>

              <Textarea id="portfolio-description" name="portfolio-description" placeholder="Enter the description of your portfolio" className="mt-2" rows={3} />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" type="reset">Cancel</Button>
            <Button type="submit">Start building your portfolio</Button>
          </CardFooter>
        </Card>
      </Form>
    </main>
  )
}