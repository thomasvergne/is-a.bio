import { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { database } from "~/db.server";
import { getSession, sessionStorage } from "~/session.server";

export const meta: MetaFunction = () => {
  const description = "is-a.bio is the best app to create your portfolio. Start building your portfolio today with is-a.bio.";

  return [
    { title: 'Login | is-a.bio' },
    {
      property: "og:title",
      content: "Login | is-a.bio",
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

export async function action({ request }: ActionFunctionArgs) {
  const authMethods = await database.collection("users").listAuthMethods();

  const url = new URL(request.url);
  const redirectURL = `${url.origin}/auth/callback`;
  const githubAuthProvider = authMethods.oauth2.providers[0];
  
  const authProviderRedirect = `${githubAuthProvider.authURL}${redirectURL}`;
  const { state, codeVerifier } = githubAuthProvider;

  const session = await getSession(request);

  session.set("state", state);
  session.set("codeVerifier", codeVerifier);

  return new Response(null, {
    headers: {
      Location: authProviderRedirect,
      "Set-Cookie": await sessionStorage.commitSession(session, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 week
      }),
    },
    status: 302,
  });
}

export default function BuilderNew() {
  return (
    <main className="min-h-screen bg-slate-100 grid place-items-center">
      <Form method="POST" className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              Login or create an account
            </CardTitle>

            <CardDescription>
              Get started by logging in or creating an account. You can start building your portfolio once you&apos;re logged in.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex justify-between">
            <Button>
              <svg role="img" fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>

              Login with GitHub
            </Button>
          </CardFooter>
        </Card>
      </Form>
    </main>
  )
}