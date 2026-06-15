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

export const vpoApi = {
  // Tasks (Kanban)
  createTask: (contractId, data) =>
    apiFetch(`/api/vpo/${contractId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getTasks: (contractId) => apiFetch(`/api/vpo/${contractId}/tasks`),
  updateTask: (contractId, taskId, data) =>
    apiFetch(`/api/vpo/${contractId}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Chat
  sendMessage: (contractId, data) =>
    apiFetch(`/api/vpo/${contractId}/messages`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMessages: (contractId) => apiFetch(`/api/vpo/${contractId}/messages`),

  // Submissions
  createSubmission: (contractId, data) =>
    apiFetch(`/api/vpo/${contractId}/submissions`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getSubmissions: (contractId) => apiFetch(`/api/vpo/${contractId}/submissions`),
  getSubmissionDetail: (contractId, submissionId) =>
    apiFetch(`/api/vpo/${contractId}/submissions/${submissionId}`),

  // Dashboard
  getDashboard: (contractId) => apiFetch(`/api/vpo/${contractId}/dashboard`),
};

export default vpoApi;