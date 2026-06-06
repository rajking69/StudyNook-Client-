import axios from "axios";

// On the browser: ALWAYS route through the Next.js /backend rewrite proxy.
// This prevents CORS errors and keeps cookies working (same-origin to the browser).
// On the server (SSR/RSC): call the backend directly via API_INTERNAL_URL.
const baseURL =
  typeof window !== "undefined"
    ? "/backend"
    : process.env.API_INTERNAL_URL || "http://localhost:5000";

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
  if (responseMessage) {
    // Guard: backend may return message as an object {code, message} — stringify it
    if (typeof responseMessage === "string") return responseMessage;
    if (typeof responseMessage?.message === "string") return responseMessage.message;
    return fallback;
  }

  const responseError = error?.response?.data?.error;
  if (responseError && typeof responseError === "string") return responseError;

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
