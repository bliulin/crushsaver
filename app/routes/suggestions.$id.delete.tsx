import { redirect } from "react-router";
import { deleteSuggestion } from "../lib/db.server";
import { requireAccessToken } from "../lib/session.server";
import type { Route } from "./+types/suggestions.$id.delete";

export async function action({ request, params }: Route.ActionArgs) {
  await requireAccessToken(request);
  const id = parseInt(params.id, 10);
  if (!isNaN(id)) {
    deleteSuggestion(id);
  }
  return redirect("/");
}

export default function SuggestionsDelete() {
  return null;
}
