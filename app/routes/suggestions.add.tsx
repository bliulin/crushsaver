import { redirect } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { addSuggestion } from "../lib/db.server";
import { extractIdentifierFromUrl } from "../lib/facebook.server";
import type { Route } from "./+types/suggestions.add";

export async function action(args: Route.ActionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) throw redirect("/sign-in");

  const formData = await args.request.formData();
  const url = (formData.get("url") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const picture = (formData.get("picture") as string)?.trim() || null;

  if (!url) return { error: "Please enter a Facebook profile URL." };
  if (!name) return { error: "Please enter a name." };

  await addSuggestion({
    facebook_url: url,
    facebook_id: extractIdentifierFromUrl(url) ?? null,
    name,
    profile_picture: picture,
  });

  return { ok: true };
}

export default function SuggestionsAdd() {
  return null;
}
