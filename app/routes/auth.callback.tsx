import { redirect } from "react-router";
import { exchangeCodeForToken } from "../lib/facebook.server";
import { createUserSession } from "../lib/session.server";
import type { Route } from "./+types/auth.callback";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    return redirect("/auth/login");
  }

  const accessToken = await exchangeCodeForToken(code);
  return createUserSession(accessToken, "/");
}

export default function AuthCallback() {
  return <p className="p-8 text-gray-600">Logging you in…</p>;
}
