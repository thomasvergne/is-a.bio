import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import { database } from "~/db.server";
import { getSession, sessionStorage } from "~/session.server";

export const meta: MetaFunction = () => {
  const description = "is-a.bio is the best app to create your portfolio. Start building your portfolio today with is-a.bio.";

  return [
    { title: 'Logout | is-a.bio' },
    {
      property: "og:title",
      content: "Logout | is-a.bio",
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
  const session = await getSession(request);

  pb.authStore.clear();

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}