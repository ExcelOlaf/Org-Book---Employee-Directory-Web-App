import { fetchAuthSession } from "aws-amplify/auth";

function toHeaders(initHeaders?: HeadersInit): Headers {
  if (initHeaders instanceof Headers) {
    return new Headers(initHeaders);
  }
  return new Headers(initHeaders ?? {});
}

export async function authenticatedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let session = await fetchAuthSession();
  let token = session.tokens?.idToken?.toString() ?? session.tokens?.accessToken?.toString();

  if (!token) {
    session = await fetchAuthSession({ forceRefresh: true });
    token = session.tokens?.idToken?.toString() ?? session.tokens?.accessToken?.toString();
  }

  if (!token) {
    throw new Error("No valid Cognito token available");
  }

  const headers = toHeaders(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, {
    ...init,
    headers,
  });
}
