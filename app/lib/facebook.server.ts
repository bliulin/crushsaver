const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";
const REDIRECT_URI =
  process.env.APP_URL
    ? `${process.env.APP_URL}/auth/callback`
    : "http://localhost:50023/auth/callback";

export function buildOAuthUrl(): string {
  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) throw new Error("FACEBOOK_APP_ID must be set");

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: REDIRECT_URI,
    scope: "public_profile",
    response_type: "code",
  });
  return `https://www.facebook.com/v19.0/dialog/oauth?${params}`;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error("FACEBOOK_APP_ID and FACEBOOK_APP_SECRET must be set");
  }

  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: REDIRECT_URI,
    code,
  });

  const res = await fetch(
    `${GRAPH_API_BASE}/oauth/access_token?${params}`
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to exchange code: ${err}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

export function extractIdentifierFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // facebook.com/profile.php?id=123456
    if (parsed.pathname === "/profile.php") {
      const id = parsed.searchParams.get("id");
      return id || null;
    }
    // facebook.com/username or facebook.com/people/name/id/
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      // Handle /people/Name/id/ URLs
      if (segments[0] === "people" && segments.length >= 3) {
        return segments[2];
      }
      return segments[0];
    }
    return null;
  } catch {
    return null;
  }
}

export interface FacebookProfile {
  id: string;
  name: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export async function lookupProfile(
  identifier: string,
  accessToken: string
): Promise<FacebookProfile> {
  const params = new URLSearchParams({
    fields: "id,name,picture.type(large)",
    access_token: accessToken,
  });

  const res = await fetch(`${GRAPH_API_BASE}/${identifier}?${params}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Facebook Graph API error: ${err}`);
  }
  return res.json();
}
