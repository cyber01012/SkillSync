import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Briefcase, CheckCircle, DollarSign, MessageSquare,
  FolderKanban, Send, Plus, Loader2, Shield, Calendar, User,
  AlertCircle, FileText, X
} from "lucide-react";
import { authApi } from "../api/auth";
import { contractsApi } from "../api/contracts";
import { vpoApi } from "../api/vpo";
import DashboardSidebar from "../components/common/DashboardSidebar";

const TABS = [
  { id: "overview", label: "Overview", icon: Briefcase },
  { id: "milestones", label: "Milestones", icon: CheckCircle },
  { id: "tasks", label: "Kanban", icon: FolderKanban },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "submissions", label: "Submissions", icon: Send },
];

const MILESTONE_STATUS = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const TASK_STATUS_COLORS = {
  todo: "bg-gray-100 border-gray-200",
  in_progress: "bg-[#EFF4FB] border-[#C5D8ED]",
  done: "bg-emerald-50 border-emerald-200",
};

export default function ContractDetail() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [contract, setContract] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [escrow, setEscrow] = useState(null);
  const [payments, setPayments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Form states
  const [newMilestone, setNewMilestone] = useState({ title: "", amount: "", due_date: "" });
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [newMessage, setNewMessage] = useState("");
  const [newSubmission, setNewSubmission] = useState({ text_content: "" });
  const [submitting, setSubmitting] = useState(false);

  const role = profile?.Role || localStorage.getItem("role");
  const isClient = role === "client";
  const isFreelancer = role === "freelancer";

  useEffect(() => {
    authApi.me().then(setProfile).catch(() => {
      window.location.href = "/login";
    });
  }, []);

  useEffect(() => {
    if (profile) loadContractData();
  }, [profile, contractId]);

  useEffect(() => {
    if (!contract || !profile) return;
    if (activeTab === "milestones") loadMilestones();
    if (activeTab === "tasks") loadTasks();
    if (activeTab === "chat") loadMessages();
    if (activeTab === "submissions") loadSubmissions();
    if (activeTab === "overview") loadOverview();
  }, [activeTab, contract, profile]);

  async function loadContractData() {
    try {
      setLoading(true);
      const [contractData, milestonesData, escrowData, paymentsData] = await Promise.all([
        contractsApi.get(contractId),
        contractsApi.getMilestones(contractId),
        contractsApi.getEscrow(contractId),
        contractsApi.getPayments(contractId),
      ]);
      setContract(contractData);
      setMilestones(milestonesData);
      setEscrow(escrowData);
      setPayments(paymentsData);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load contract");
    } finally {
      setLoading(false);
    }
  }

  async function loadOverview() {
    try {
      const data = await vpoApi.getDashboard(contractId);
      setDashboard(data);
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  }

  async function loadMilestones() {
    try {
      const data = await contractsApi.getMilestones(contractId);
      setMilestones(data);
    } catch (err) {
      console.error("Milestones load error:", err);
    }
  }

  async function loadTasks() {
    try {
      const data = await vpoApi.getTasks(contractId);
      setTasks(data);
    } catch (err) {
      console.error("Tasks load error:", err);
    }
  }

  async function loadMessages() {
    try {
      const data = await vpoApi.getMessages(contractId);
      setMessages(data);
    } catch (err) {
      console.error("Messages load error:", err);
    }
  }

  async function loadSubmissions() {
    try {
      const data = await vpoApi.getSubmissions(contractId);
      setSubmissions(data);
    } catch (err) {
      console.error("Submissions load error:", err);
    }
  }

  async function handleAddMilestone(e) {
    e.preventDefault();
    if (!newMilestone.title || !newMilestone.amount) return;
    try {
      await contractsApi.addMilestone(contractId, {
        title: newMilestone.title,
        amount: Number(newMilestone.amount),
        due_date: newMilestone.due_date || null,
      });
      setNewMilestone({ title: "", amount: "", due_date: "" });
      loadMilestones();
      setMessage("Milestone added successfully");
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Failed to add milestone");
    }
  }

  async function handleApproveMilestone(milestoneId) {
    if (!window.confirm("Approve this milestone and release payment?")) return;
    try {
      await contractsApi.approveMilestone(milestoneId);
      loadMilestones();
      loadContractData();
      setMessage("Milestone approved and payment released");
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Failed to approve milestone");
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      await vpoApi.createTask(contractId, {
        title: newTask.title,
        description: newTask.description,
        status: "todo",
      });
      setNewTask({ title: "", description: "" });
      loadTasks();
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Failed to create task");
    }
  }

  async function handleUpdateTaskStatus(taskId, newStatus) {
    try {
      await vpoApi.updateTask(contractId, taskId, { status: newStatus });
      loadTasks();
    } catch (err) {
      console.error("Task update error:", err);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await vpoApi.sendMessage(contractId, { body: newMessage });
      setNewMessage("");
      loadMessages();
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Failed to send message");
    }
  }

  async function handleSubmitWork(e) {
    e.preventDefault();
    if (!newSubmission.text_content.trim()) return;
    setSubmitting(true);
    try {
      await vpoApi.createSubmission(contractId, {
        text_content: newSubmission.text_content,
        files: [],
      });
      setNewSubmission({ text_content: "" });
      loadSubmissions();
      setMessage("Work submitted successfully");
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center premium-dashboard-bg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-[#133B6C]" />
          <p className="font-bold text-[var(--fg-primary)]">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center premium-dashboard-bg">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-3" />
          <p className="text-[var(--fg-primary)] font-bold mb-4">{error || "Contract not found"}</p>
          <button type="button" onClick={() => navigate("/contracts")} className="btn-primary">
            Back to Contracts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex premium-dashboard-bg">
      <DashboardSidebar role={role} user={profile} />

      <main className="flex-1 p-6 overflow-y-auto">
        <button
          type="button"
          onClick={() => navigate("/contracts")}
          className="flex items-center gap-2 text-sm font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] mb-4"
        >
          <ArrowLeft size={16} /> Back to Contracts
        </button>

        {/* Header */}
        <div className="premium-glass-card rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[var(--fg-primary)]">
                {contract.job_title || "Contract"}
              </h1>
              <p className="text-sm text-[var(--fg-muted)] mt-1">
                Contract #{contract.ContractID} • {isClient
                  ? `Freelancer: ${contract.freelancer_name || "Unknown"}`
                  : `Client: ${contract.client_name || "Unknown"}`
                }
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold capitalize border ${
              contract.Status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
              contract.Status === "completed" ? "bg-blue-100 text-blue-700 border-blue-200" :
              "bg-amber-100 text-amber-700 border-amber-200"
            }`}>
              <Shield size={14} /> {contract.Status}
            </span>
          </div>
        </div>

        {message && (
          <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--color-coral-50)] px-4 py-3 text-sm font-semibold text-[var(--fg-primary)] flex items-center justify-between">
            {message}
            <button type="button" onClick={() => setMessage("")}><X size={14} /></button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Amount", value: `$${contract.TotalAmount?.toLocaleString() || "0"}`, icon: DollarSign, color: "bg-[#133B6C]" },
            { label: "Escrow Balance", value: `$${escrow?.escrow_balance?.toLocaleString() || "0"}`, icon: Shield, color: "bg-[#5F90D4]" },
            { label: "Milestones", value: `${milestones.filter(m => m.Status === "approved").length} / ${milestones.length}`, icon: CheckCircle, color: "bg-[#FD8566]" },
            { label: "Messages", value: dashboard?.total_messages || 0, icon: MessageSquare, color: "bg-emerald-500" },
          ].map((stat) => (
            <div key={stat.label} className="premium-glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon size={16} className="text-white" />
                </div>
                <span className="text-xs font-bold text-[var(--fg-muted)] uppercase">{stat.label}</span>
              </div>
              <p className="text-xl font-black text-[var(--fg-primary)]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[var(--border)] pb-2 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === id
                  ? "bg-[var(--ui-primary)] text-white"
                  : "text-[var(--fg-secondary)] hover:bg-[var(--muted)]"
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="premium-glass-card rounded-2xl p-6">
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-[var(--fg-primary)] mb-3">Contract Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--fg-muted)]">Job ID:</span>
                    <span className="font-semibold">{contract.JobID}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--fg-muted)]">Freelancer:</span>
                    <span className="font-semibold">{contract.freelancer_name || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--fg-muted)]">Client:</span>
                    <span className="font-semibold">{contract.client_name || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--fg-muted)]">Created:</span>
                    <span className="font-semibold">
                      {contract.CreatedAt ? new Date(contract.CreatedAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {payments.length > 0 && (
                <div>
                  <h3 className="font-bold text-[var(--fg-primary)] mb-3">Recent Activity</h3>
                  <div className="space-y-2">
                    {payments.slice(0, 5).map((payment, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-[var(--border)]">
                        <div className="flex items-center gap-2">
                          <DollarSign size={14} className="text-[#FD8566]" />
                          <span className="text-sm font-semibold">
                            {payment.EventType === "escrow_deposit" ? "Escrow Deposit" : "Payment Released"}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[var(--fg-primary)]">
                            ${payment.Amount?.toLocaleString()}
                          </p>
                          <p className="text-xs text-[var(--fg-muted)]">
                            {payment.ProcessedAt ? new Date(payment.ProcessedAt).toLocaleDateString() : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MILESTONES */}
          {activeTab === "milestones" && (
            <div className="space-y-4">
              {isClient && (
                <form onSubmit={handleAddMilestone} className="p-4 rounded-xl bg-white/50 border border-[var(--border)]">
                  <h3 className="font-bold text-[var(--fg-primary)] mb-3 flex items-center gap-2">
                    <Plus size={16} /> Add Milestone
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      className="input"
                      placeholder="Milestone title"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                      required
                    />
                    <input
                      type="number"
                      className="input"
                      placeholder="Amount ($)"
                      value={newMilestone.amount}
                      onChange={(e) => setNewMilestone({ ...newMilestone, amount: e.target.value })}
                      required
                    />
                    <input
                      type="date"
                      className="input"
                      value={newMilestone.due_date}
                      onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn-primary mt-3">
                    <Plus size={14} className="mr-1" /> Add Milestone
                  </button>
                </form>
              )}

              <div className="space-y-3">
                {milestones.map((milestone) => (
                  <div key={milestone.MilestoneID} className="p-4 rounded-xl bg-white/50 border border-[var(--border)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-[var(--fg-primary)]">{milestone.Title}</h4>
                        <p className="text-sm text-[var(--fg-muted)] mt-1">
                          ${milestone.Amount?.toLocaleString()} • Due: {milestone.DueDate
                            ? new Date(milestone.DueDate).toLocaleDateString()
                            : "No due date"
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${
                          MILESTONE_STATUS[milestone.Status] || MILESTONE_STATUS.pending
                        }`}>
                          {milestone.Status}
                        </span>
                        {isClient && milestone.Status === "pending" && (
                          <button
                            type="button"
                            onClick={() => handleApproveMilestone(milestone.MilestoneID)}
                            className="btn-primary !py-1.5 !px-3 !text-xs"
                          >
                            <CheckCircle size={12} className="mr-1" /> Approve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {milestones.length === 0 && (
                  <p className="text-center text-[var(--fg-muted)] py-6">No milestones yet</p>
                )}
              </div>
            </div>
          )}

          {/* KANBAN */}
          {activeTab === "tasks" && (
            <div className="space-y-4">
              <form onSubmit={handleCreateTask} className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="New task title..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Description..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
                <button type="submit" className="btn-primary">
                  <Plus size={14} /> Add
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["todo", "in_progress", "done"].map((status) => (
                  <div key={status} className="rounded-xl bg-white/30 border border-[var(--border)] p-3">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--fg-muted)] mb-3">
                      {status.replace("_", " ")}
                    </h4>
                    <div className="space-y-2">
                      {tasks.filter((t) => t.status === status).map((task) => (
                        <div
                          key={task.task_id}
                          className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                            TASK_STATUS_COLORS[task.status] || TASK_STATUS_COLORS.todo
                          }`}
                          onClick={() => handleUpdateTaskStatus(
                            task.task_id,
                            status === "todo" ? "in_progress" : status === "in_progress" ? "done" : "todo"
                          )}
                        >
                          <p className="text-sm font-semibold text-[var(--fg-primary)]">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-[var(--fg-muted)] mt-1">{task.description}</p>
                          )}
                        </div>
                      ))}
                      {tasks.filter((t) => t.status === status).length === 0 && (
                        <p className="text-xs text-[var(--fg-muted)] text-center py-2">No tasks</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHAT */}
          {activeTab === "chat" && (
            <div className="space-y-4">
              <div className="h-[400px] overflow-y-auto form-scroll space-y-3 p-3 rounded-xl bg-white/30 border border-[var(--border)]">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.sender_id === profile?.UserID ? "flex-row-reverse" : ""}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--ui-primary-50)] flex items-center justify-center shrink-0">
                      <User size={14} className="text-[var(--ui-primary)]" />
                    </div>
                    <div className={`max-w-[70%] p-3 rounded-xl text-sm ${
                      msg.sender_id === profile?.UserID
                        ? "bg-[#133B6C] text-white"
                        : "bg-white border border-[var(--border)] text-[var(--fg-primary)]"
                    }`}>
                      <p className="text-xs font-bold mb-1 opacity-75">{msg.sender_name}</p>
                      <p>{msg.body}</p>
                      <p className="text-[10px] opacity-50 mt-1">
                        {msg.sent_at ? new Date(msg.sent_at).toLocaleTimeString() : ""}
                      </p>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-center text-[var(--fg-muted)] py-8">No messages yet</p>
                )}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage(e)}
                />
                <button type="submit" className="btn-primary">
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}

          {/* SUBMISSIONS */}
          {activeTab === "submissions" && (
            <div className="space-y-4">
              {isFreelancer && (
                <form onSubmit={handleSubmitWork} className="p-4 rounded-xl bg-white/50 border border-[var(--border)]">
                  <h3 className="font-bold text-[var(--fg-primary)] mb-3">Submit Work</h3>
                  <textarea
                    className="input min-h-[120px] resize-y"
                    placeholder="Describe your work or paste code/content..."
                    value={newSubmission.text_content}
                    onChange={(e) => setNewSubmission({ ...newSubmission, text_content: e.target.value })}
                    required
                  />
                  <button type="submit" disabled={submitting} className="btn-primary mt-3">
                    {submitting ? (
                      <><Loader2 size={14} className="animate-spin mr-1" /> Submitting...</>
                    ) : (
                      <><Send size={14} className="mr-1" /> Submit Work</>
                    )}
                  </button>
                </form>
              )}

              <div className="space-y-3">
                {submissions.map((sub, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/50 border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[#5F90D4]" />
                        <span className="font-bold text-sm text-[var(--fg-primary)]">
                          Submission v{sub.version}
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        sub.fraud_status === "flagged"
                          ? "bg-red-100 text-red-700"
                          : sub.fraud_status === "cleared"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {sub.fraud_status || "Pending Review"}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--fg-secondary)] line-clamp-3">
                      {sub.text_content || "No text content"}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[var(--fg-muted)]">
                      <span>{sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : ""}</span>
                      {sub.ai_score !== null && (
                        <span>AI Score: {(sub.ai_score * 100).toFixed(0)}%</span>
                      )}
                    </div>
                    {sub.fraud_flags?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {sub.fraud_flags.map((flag, fidx) => (
                          <div key={fidx} className="flex items-center gap-1 text-xs text-red-600">
                            <AlertCircle size={12} />
                            {flag.type}: {flag.details}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {submissions.length === 0 && (
                  <p className="text-center text-[var(--fg-muted)] py-6">No submissions yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}