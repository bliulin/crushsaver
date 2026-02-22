export function extractIdentifierFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.pathname === "/profile.php") {
      return parsed.searchParams.get("id");
    }
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      if (segments[0] === "people" && segments.length >= 3) return segments[2];
      return segments[0];
    }
    return null;
  } catch {
    return null;
  }
}
