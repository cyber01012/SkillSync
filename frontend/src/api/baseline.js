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

export const baselineApi = {
  getChallenge: () => apiFetch("/api/baseline/challenge"),
  start: (challenge_id) =>
    apiFetch("/api/baseline/start", {
      method: "POST",
      body: JSON.stringify({ challenge_id }),
    }),
  step: (data) =>
    apiFetch("/api/baseline/step", { method: "POST", body: JSON.stringify(data) }),
  run: (data) =>
    apiFetch("/api/baseline/run", { method: "POST", body: JSON.stringify(data) }),
  submit: (data) =>
    apiFetch("/api/baseline/submit", { method: "POST", body: JSON.stringify(data) }),
  getResults: () => apiFetch("/api/baseline/results"),
  getSessionStatus: (sessionId) => apiFetch(`/api/baseline/session/${sessionId}/status`),
};
