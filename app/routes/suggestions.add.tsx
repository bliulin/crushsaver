import { addSuggestion } from "../lib/db.server";
import { extractIdentifierFromUrl, lookupProfile } from "../lib/facebook.server";
import { requireAccessToken } from "../lib/session.server";
import type { Route } from "./+types/suggestions.add";

const useGraphApiIntegration = process.env.USE_GRAPH_API_INTEGRATION === "true";

export async function action({ request }: Route.ActionArgs) {
  const accessToken = await requireAccessToken(request);
  const formData = await request.formData();
  const url = (formData.get("url") as string)?.trim();
  const manualName = (formData.get("name") as string)?.trim();
  const manualPicture = (formData.get("picture") as string)?.trim() || null;

  if (!url) return { error: "Please enter a Facebook profile URL." };

  const identifier = extractIdentifierFromUrl(url) ?? null;

  if (useGraphApiIntegration) {
    if (!identifier) {
      return { error: "Could not parse a profile identifier from that URL." };
    }
    try {
      const profile = await lookupProfile(identifier, accessToken);
      await addSuggestion({
        facebook_url: url,
        facebook_id: profile.id,
        name: profile.name,
        profile_picture: profile.picture?.data?.url ?? null,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      return { error: `Failed to look up profile: ${message}` };
    }
  } else {
    if (!manualName) return { error: "Please enter a name." };
    await addSuggestion({
      facebook_url: url,
      facebook_id: identifier,
      name: manualName,
      profile_picture: manualPicture,
    });
  }

  return { ok: true };
}

export default function SuggestionsAdd() {
  return null;
}
