import { LoaderFunction, redirect } from "@remix-run/node";
import { database } from "~/db.server";
import { getSession, sessionStorage } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const pb = database;
  const url = new URL(request.url);
  const redirectURL = `${url.origin}/auth/callback`;
  const session = await getSession(request);
  const expectedState = await session.get("state");
  const expectedCodeVerifier = await await session.get("codeVerifier");
  // google sends back this state...
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  const authMethods = await pb.collection("users").listAuthMethods();
  const provider = authMethods.oauth2.providers[0];

  if (expectedState === undefined) {
    throw new Response("expectedState is undefined!", { status: 500 });
  }

  if (expectedState !== state) {
    throw new Response("Github Auth State Mismatch!", { status: 500 });
  }

  if (!code || !state) {
    throw new Response("No code or state!", { status: 500 });
  }

  try {
    const githubUserMetaData = await pb
      .collection("users")
      .authWithOAuth2Code(
        provider.name,
        code,
        expectedCodeVerifier,
        redirectURL
      );
  
    const { avatarURL, username, name, email } = githubUserMetaData.meta ?? {};

    session.set("email", email);
    session.set("username", username);
    session.set("name", name);
    session.set("avatarURL", avatarURL);

    session.set('id', githubUserMetaData.record.id);
  } catch (error) {
    throw new Response("Failed to authenticate.", { status: 500 });
  }

  return redirect("/", {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week
    }) },
  });
};