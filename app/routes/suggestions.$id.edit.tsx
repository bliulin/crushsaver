import { updateSuggestion } from "../lib/db.server";
import { requireAccessToken } from "../lib/session.server";
import type { Route } from "./+types/suggestions.$id.edit";

export async function action({ request, params }: Route.ActionArgs) {
  await requireAccessToken(request);
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return { error: "Invalid ID." };

  const formData = await request.formData();
  const url = (formData.get("url") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const picture = (formData.get("picture") as string)?.trim() || null;

  if (!url) return { error: "Please enter a Facebook profile URL." };
  if (!name) return { error: "Please enter a name." };

  try {
    updateSuggestion(id, { facebook_url: url, name, profile_picture: picture });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { error: `Failed to save: ${message}` };
  }

  return { ok: true };
}

export default function SuggestionsEdit() {
  return null;
}
