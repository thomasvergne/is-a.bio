import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { database } from "~/db.server";
import { getSession } from "~/session.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const pb = database;
  const { slug } = params;

  if (!slug) {
    return redirect("/builder/new");
  }

  const session = await getSession(request);

  if (!session) {
    return redirect("/login");
  }

  try {
    await pb.collection('websites').delete(slug);
  } catch(e) {
    return redirect("/builder/new");
  }
}