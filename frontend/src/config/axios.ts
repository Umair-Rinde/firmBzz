import OgAxios from "axios";
import { toast } from "sonner";
import { queryClient } from "./query-client";

const rawBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim() ?? "";
const baseURL = rawBase.replace(/\/$/, "");

if (!baseURL) {
  console.error(
    "[API] VITE_API_URL is not set. Set it in Vercel Project → Settings → Environment Variables and redeploy.",
  );
} else if (import.meta.env.PROD && typeof window !== "undefined") {
  const pageHttps = window.location.protocol === "https:";
  const apiHttp = baseURL.startsWith("http://");
  if (pageHttps && apiHttp) {
    console.error(
      "[API] Mixed content: the app is on HTTPS but VITE_API_URL is HTTP. Mobile browsers will block these requests. Use an HTTPS API URL.",
    );
  }
}

export const axios = OgAxios.create({
  baseURL: baseURL || undefined,
  // Bearer token in Authorization header; no session cookies — keep default false
  withCredentials: false,
});

axios.interceptors.request.use(function (req) {
  const queryToken = new URLSearchParams(window.location.search).get("token");
  let token = localStorage.getItem("token");
  if (queryToken) {
    token = queryToken;
  }
  if (token) {
    req.headers["Authorization"] = `Bearer ${token}`;
  }

  return req;
});
axios.interceptors.response.use(
  function (response) {
    if (response.config.method === "get") {
      return response;
    }

    return response;
  },
  (err) => {
    let status = err.response?.status || null;
    if (status && status === 401) {
      toast.info("Your session has expired. Please log in again.");
      localStorage.clear();
      sessionStorage.clear();
      queryClient.removeQueries();
      setTimeout(() => {
        window.location.pathname = "/login";
      }, 2000);
    } else {
      const cfg = err.config;
      console.error("[API] request failed", {
        method: cfg?.method,
        url: cfg?.baseURL != null ? `${cfg.baseURL}${cfg.url ?? ""}` : cfg?.url,
        status: err.response?.status,
        message: err.message,
        code: err.code,
      });
      throw err;
    }
  },
);
