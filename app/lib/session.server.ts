import { createCookieSessionStorage, redirect } from "react-router";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__crushsaver_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function getAccessToken(request: Request): Promise<string | null> {
  const session = await getSession(request);
  return session.get("accessToken") ?? null;
}

export async function requireAccessToken(request: Request): Promise<string> {
  const token = await getAccessToken(request);
  if (!token) {
    throw redirect("/auth/login");
  }
  return token;
}

export async function createUserSession(
  accessToken: string,
  redirectTo: string
) {
  const session = await sessionStorage.getSession();
  session.set("accessToken", accessToken);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function destroySession(request: Request) {
  const session = await getSession(request);
  return redirect("/auth/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
