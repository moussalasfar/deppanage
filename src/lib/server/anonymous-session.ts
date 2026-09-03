import "server-only";

export const anonymousSessionCookieName = "depannage_session";

export function readAnonymousSessionId(request: Request) {
  return request.headers
    .get("cookie")
    ?.match(new RegExp(`(?:^|; )${anonymousSessionCookieName}=([^;]+)`))?.[1];
}
