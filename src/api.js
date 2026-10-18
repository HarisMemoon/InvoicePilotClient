// src/api.js — shared axios instance for the whole app.
//
// - baseURL comes from VITE_BACKEND_URL (see .env / .env.production).
//   Falls back to localhost:5000 so local dev keeps working.
// - Request interceptor attaches the Bearer token automatically, so pages
//   no longer need to pass `headers: { Authorization: ... }` by hand.
// - Response interceptor: on 401 it tries ONE silent token refresh via
//   POST /api/auth/refresh, then retries the original request. Auth routes
//   (/api/auth/*) are excluded so a bad login can never trigger a loop.
// - timeout is 60s: Render's free tier cold-starts after idle and the first
//   request can take 30-60s. A short timeout would fail it needlessly.

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null; // single-flight: parallel 401s share one refresh

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};

    // Only retry once, never on auth routes, and never on network errors.
    if (
      error.response?.status === 401 &&
      !original._retried &&
      !original.url?.includes("/auth/")
    ) {
      original._retried = true;

      try {
        refreshPromise =
          refreshPromise ||
          api.post("/api/auth/refresh", {
            refresh_token: localStorage.getItem("refresh_token"),
          });

        const { data } = await refreshPromise;
        refreshPromise = null;

        const session = data?.data?.session;
        if (session?.access_token) {
          localStorage.setItem("token", session.access_token);
          if (session.refresh_token) {
            localStorage.setItem("refresh_token", session.refresh_token);
          }
          original.headers.Authorization = `Bearer ${session.access_token}`;
          return api(original);
        }
      } catch {
        refreshPromise = null;
        // Refresh failed -> session is dead. Log the user out.
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
