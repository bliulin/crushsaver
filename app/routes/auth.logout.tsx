import { destroySession } from "../lib/session.server";
import type { Route } from "./+types/auth.logout";

export async function action({ request }: Route.ActionArgs) {
  return destroySession(request);
}

export async function loader({ request }: Route.LoaderArgs) {
  return destroySession(request);
}

export default function AuthLogout() {
  return null;
}
