import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { database } from "~/db.server";
import { getSession } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const redirectURL = url.searchParams.get('redirect') ?? '/';

  await database.collection('users').authRefresh();

  const session = await getSession(request);

  if (!session) {
    return redirect('/login');
  }

  return redirect(redirectURL);
}