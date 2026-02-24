import axios from "axios";

// @aws-amplify/auth v6 exports individual functions, not a class.
// This wrapper adapts the v6 fetchAuthSession API for the interceptor.
let _AuthModule = null;
async function getAuth() {
  if (_AuthModule) return _AuthModule;
  try {
    const authFns = await import("@aws-amplify/auth");
    _AuthModule = {
      async currentSession() {
        const session = await authFns.fetchAuthSession();
        return {
          getAccessToken() {
            const token = session?.tokens?.accessToken?.toString();
            return { getJwtToken() { return token || null; } };
          },
          getIdToken() {
            const token = session?.tokens?.idToken?.toString();
            return { getJwtToken() { return token || null; } };
          },
        };
      }
    };
  } catch (e) {
    _AuthModule = null;
  }
  return _AuthModule;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Cognito ID token when available (contains custom claims like email and groups)
apiClient.interceptors.request.use((config) => {
  return (async () => {
    try {
      const Auth = await getAuth();
      if (!Auth) return config;
      const session = await Auth.currentSession();
      const idToken = session?.getIdToken?.()?.getJwtToken?.(); // Changed from getAccessToken to getIdToken
      if (idToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${idToken}`;
      }
    } catch (e) {
      // Not signed in or session expired — proceed without Authorization header
    }
    return config;
  })();
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    throw error;
  }
);

export default apiClient;

