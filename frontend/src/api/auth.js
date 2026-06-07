const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function jsonFetch(path, { method = "GET", body, token, params, headers: extraHeaders, keepalive = false } = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  if (params && typeof params === "object") {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  const headers = { "Content-Type": "application/json", ...(extraHeaders || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  return fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "omit",
    keepalive,
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error || data?.message || `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  });
}


export const authApi = {
  login: (payload) => jsonFetch("/auth/login", { method: "POST", body: payload }),
  signup: (payload) => jsonFetch("/auth/signup", { method: "POST", body: payload }),
  logout: () => {
    const sessionId = typeof window !== "undefined" ? localStorage.getItem("session_id") : null;
   return jsonFetch("/auth/logout", {
      method: "POST",
      body: {},
      keepalive: true,
      headers: {
        "Session-Id": sessionId || "",
        "User-Agent": typeof navigator !== "undefined" ? navigator.userAgent : "",
      },
    });
  },
  sendOtp: (email) =>
    jsonFetch("/api/otp/forgot-password", {
      method: "POST",
      params: { email },
    }),
  resendForgotPassword: (email) =>
    jsonFetch("/api/otp/forgot-password/resend", {
      method: "POST",
      params: { email },
    }),
  resetWithOtp: ({ email, otp, newPassword }) =>
    jsonFetch("/password/forgot", {
      method: "POST",
      body: { email, otp, newPassword },
    }),
};

export const oauthApi = {
  startGoogle: () => {
    window.location.href = `${BASE_URL}/auth/google`;
  },
};
