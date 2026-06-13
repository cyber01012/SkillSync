const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw { response: { status: res.status, data: err } };
  }

  return res.json();
}

export const baselineApi = {
  getChallenges: () => apiFetch("/api/baseline/challenge"),

  submitChallenge: (data) =>
    apiFetch("/api/baseline/submit", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getResults: () => apiFetch("/api/baseline/results"),
};