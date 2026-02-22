import { redirect } from "react-router";
import { buildOAuthUrl } from "../lib/facebook.server";
import { getAccessToken } from "../lib/session.server";
import type { Route } from "./+types/auth.login";

export async function loader({ request }: Route.LoaderArgs) {
  // Already logged in → go home
  const token = await getAccessToken(request);
  if (token) return redirect("/");

  return redirect(buildOAuthUrl());
}

export default function AuthLogin() {
  return null;
}
