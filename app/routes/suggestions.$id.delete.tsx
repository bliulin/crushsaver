import { redirect } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { deleteSuggestion } from "../lib/db.server";
import type { Route } from "./+types/suggestions.$id.delete";

export async function action(args: Route.ActionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) throw redirect("/sign-in");

  const id = args.params.id;
  if (id) await deleteSuggestion(id, userId);

  return redirect("/");
}

export default function SuggestionsDelete() {
  return null;
}
