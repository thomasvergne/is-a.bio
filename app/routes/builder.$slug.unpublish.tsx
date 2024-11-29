import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { database } from "~/db.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const pb = database;
  const { slug } = params;

  if (!slug) {
    return redirect("/builder/new");
  }

  try {
    const website = await pb.collection("websites").getOne(slug);

    if (!website.published) {
      return redirect("/builder/new");
    }

    await pb.collection("websites").update(slug, {
      published: false,
    });

    return redirect(`/builder/${slug}`);


  } catch (e) {
    return redirect("/builder/new");
  }
}