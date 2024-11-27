import { createCookieSessionStorage } from "@remix-run/node";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "hullowurld"],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");

  return sessionStorage.getSession(cookie);
}

export async function fetchUser(request: Request): Promise<UserData | null> {
  const session = await getSession(request);
  const email = await session.get("email");
  const username = await session.get("username");
  const name = await session.get("name");
  const avatarURL = await session.get("avatarURL");
  const id = await session.get("id");
  
  if (!email || !username || !name || !avatarURL || !id) {
    return null;
  }

  return {
    email,
    username,
    name,
    avatarURL,
    id,
  };
}

export interface UserData {
  email: string;
  username: string;
  name: string;
  avatarURL: string;
  id: string;
}