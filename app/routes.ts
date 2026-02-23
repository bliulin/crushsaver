import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("sign-in/*", "routes/sign-in.$.tsx"),
  route("suggestions/add", "routes/suggestions.add.tsx"),
  route("suggestions/reorder", "routes/suggestions.reorder.tsx"),
  route("suggestions/:id/delete", "routes/suggestions.$id.delete.tsx"),
  route("suggestions/:id/edit", "routes/suggestions.$id.edit.tsx"),
] satisfies RouteConfig;
