import axios from "axios";

function resolveBaseURL() {
  let url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (url) {
    // Guard against env vars set without protocol (e.g. "study-nook-server-peach.vercel.app")
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/")) {
      url = "https://" + url;
    }
    return url;
  }
  // No env var: use the Next.js rewrite proxy on the client, direct URL server-side
  return typeof window !== "undefined" ? "/backend" : "http://localhost:5000";
}

const baseURL = resolveBaseURL();

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

/** Send Better Auth JWT when cached (backend verifies via JWKS). */
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const baJwt = sessionStorage.getItem("studynook_ba_jwt");
      if (baJwt && !config.headers?.Authorization) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${baJwt}`;
      }
    } catch {
      /* ignore */
    }
  }
  return config;
});

export const getErrorMessage = (error, fallback = "Something went wrong.") => {
  if (!error) return fallback;
  if (typeof error === "string") return error;

  const responseMessage = error?.response?.data?.message;
  if (responseMessage) return responseMessage;

  const responseError = error?.response?.data?.error;
  if (responseError) return responseError;

  if (error?.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }

  const message = error?.message;
  if (message) {
    if (message === "Network Error" || message === "Failed to fetch") {
      return "Network error. Please check your connection and try again.";
    }
    return message;
  }

  return fallback;
};

export default api;
