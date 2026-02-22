import { addSuggestion } from "../lib/db.server";
import { extractIdentifierFromUrl } from "../lib/facebook.server";
import { requireAccessToken } from "../lib/session.server";
import type { Route } from "./+types/suggestions.add";

export async function action({ request }: Route.ActionArgs) {
  await requireAccessToken(request);
  const formData = await request.formData();
  const url = (formData.get("url") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const picture = (formData.get("picture") as string)?.trim() || null;

  if (!url) return { error: "Please enter a Facebook profile URL." };
  if (!name) return { error: "Please enter a name." };

  const identifier = extractIdentifierFromUrl(url);
  const facebookId = identifier ?? null;

  await addSuggestion({
    facebook_url: url,
    facebook_id: facebookId,
    name,
    profile_picture: picture,
  });

  return { ok: true };
}

export default function SuggestionsAdd() {
  return null;
}
