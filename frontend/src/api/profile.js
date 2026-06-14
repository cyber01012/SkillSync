const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
    throw { response: { status: 401, data: { detail: "Unauthorized" } } };
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw { response: { status: res.status, data: err } };
  }

  return res.json();
}

export const profileApi = {
  get: () => apiFetch("/api/me/profile"),
  update: (data) =>
    apiFetch("/api/me/profile", { method: "PUT", body: JSON.stringify(data) }),
  uploadPhoto: async (file) => {
    const token = localStorage.getItem("accessToken");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/api/me/photo`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
  getStatus: () => apiFetch("/api/me/profile/status"),
};
