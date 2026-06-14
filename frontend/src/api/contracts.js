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

export const contractsApi = {
  // Contracts
  create: (data) =>
    apiFetch("/api/contracts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  myContracts: () => apiFetch("/api/contracts/my"),
  get: (id) => apiFetch(`/api/contracts/${id}`),
  
  // Milestones
  addMilestone: (contractId, data) =>
    apiFetch(`/api/contracts/${contractId}/milestones`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMilestones: (contractId) => apiFetch(`/api/contracts/${contractId}/milestones`),
  approveMilestone: (milestoneId) =>
    apiFetch(`/api/contracts/milestones/${milestoneId}/approve`, {
      method: "PUT",
    }),
  
  // Escrow
  getEscrow: (contractId) => apiFetch(`/api/contracts/${contractId}/escrow`),
  getPayments: (contractId) => apiFetch(`/api/contracts/${contractId}/payments`),
  
  // Disputes
  raiseDispute: (contractId, description) =>
    apiFetch(`/api/contracts/${contractId}/disputes`, {
      method: "POST",
      body: JSON.stringify({ contract_id: contractId, description }),
    }),
  getDisputes: (contractId) => apiFetch(`/api/contracts/${contractId}/disputes`),
};

export const vpoApi = {
  // Tasks
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
  
  // Messages
  sendMessage: (contractId, body, attachments = []) =>
    apiFetch(`/api/vpo/${contractId}/messages`, {
      method: "POST",
      body: JSON.stringify({ body, attachments }),
    }),
  getMessages: (contractId) => apiFetch(`/api/vpo/${contractId}/messages`),
  
  // Submissions
  createSubmission: (contractId, data) =>
    apiFetch(`/api/vpo/${contractId}/submissions`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getSubmissions: (contractId) => apiFetch(`/api/vpo/${contractId}/submissions`),
  getSubmission: (contractId, submissionId) =>
    apiFetch(`/api/vpo/${contractId}/submissions/${submissionId}`),
  
  // Dashboard
  getDashboard: (contractId) => apiFetch(`/api/vpo/${contractId}/dashboard`),
};