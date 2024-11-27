import { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import { database } from "~/db.server";
import { getSession, sessionStorage } from "~/session.server";

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