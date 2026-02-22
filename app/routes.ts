import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("auth/login", "routes/auth.login.tsx"),
  route("auth/callback", "routes/auth.callback.tsx"),
  route("auth/logout", "routes/auth.logout.tsx"),
  route("suggestions/add", "routes/suggestions.add.tsx"),
  route("suggestions/:id/delete", "routes/suggestions.$id.delete.tsx"),
  route("suggestions/:id/edit", "routes/suggestions.$id.edit.tsx"),
] satisfies RouteConfig;
