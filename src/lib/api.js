import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== "undefined" ? "/backend" : "http://localhost:5000");

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
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
