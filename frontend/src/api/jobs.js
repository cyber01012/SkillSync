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
    window.location.href = "/login";
    throw { response: { status: 401 } };
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw { response: { status: res.status, data: err } };
  }
  return res.json();
}

export const jobsApi = {
  browse: () => apiFetch("/api/jobs"),
  get: (id) => apiFetch(`/api/jobs/${id}`),
  apply: (jobId, cover_note = "") =>
    apiFetch(`/api/jobs/${jobId}/apply`, {
      method: "POST",
      body: JSON.stringify({ cover_note }),
    }),
  myApplications: () => apiFetch("/api/jobs/applications/mine"),
};
