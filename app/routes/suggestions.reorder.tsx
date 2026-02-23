import { redirect } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { reorderSuggestions } from "../lib/db.server";
import type { Route } from "./+types/suggestions.reorder";

export async function action(args: Route.ActionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) throw redirect("/sign-in");

  const formData = await args.request.formData();
  const raw = formData.get("ids") as string;
  if (!raw) return { ok: true };

  const ids: string[] = JSON.parse(raw);
  await reorderSuggestions(userId, ids);
  return { ok: true };
}

export default function SuggestionsReorder() {
  return null;
}
