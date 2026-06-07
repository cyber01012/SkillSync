const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function authHeaders(explicitToken) {
  const t = explicitToken ?? (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function jsonFetch(path, { method = "GET", params, body, token, headers: extraHeaders } = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  if (params && typeof params === "object") {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const headers = {
    ...authHeaders(token),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(extraHeaders || {}),
  };

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    credentials: "omit",
  });

  const raw = await res.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
  }

  if (!res.ok) {
    const msg = data?.message || data?.error || raw || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data || raw;
    throw err;
  }

  return Object.keys(data || {}).length ? data : raw;
}

export const dashboardApi = {
  async getSummaryForCurrentUser() {
    return await jsonFetch(`/api/dashboard/summary`, { method: "GET" });
  },
  async getActivityMinimal(limit = 50) {
    return await jsonFetch(`/activity/me/minimal`, {
      method: "GET",
      params: { limit },
    });
  },
};

export const profileApi = {
  async updateProfile(fields) {
    return await jsonFetch(`/user/profile`, { method: "PUT", body: fields });
  },
  async uploadPhoto(file) {
    const form = new FormData();
    form.append("file", file);
    return await jsonFetch(`/user/profile-photo`, {
      method: "POST",
      body: form,
    });
  },
  async deletePhoto() {
    return await jsonFetch(`/user/profile-photo`, { method: "DELETE" });
  },
  async getProfile() {
    return await jsonFetch(`/user/profile`, { method: "GET" });
  },
};

export const passwordApi = {
  async changePassword(payload, opts = {}) {
    const path = `/change/change-password`;
    return await jsonFetch(path, { method: "POST", body: payload, ...opts });
  },
};
