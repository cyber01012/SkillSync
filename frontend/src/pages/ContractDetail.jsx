import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Briefcase, DollarSign, Shield, CheckCircle, Clock, AlertCircle,
  Plus, MessageSquare, FolderKanban, Send
} from "lucide-react";
import { contractsApi } from "../api/contracts";
import { vpoApi } from "../api/contracts";
import { authApi } from "../api/auth";

export default function ContractDetail() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [escrow, setEscrow] = useState(null);
  const [payments, setPayments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "todo" });

  useEffect(() => {
    authApi.me().then(setUser).catch(() => {});
    loadData();
  }, [contractId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contractData, milestonesData, escrowData, paymentsData, dashboardData] = await Promise.all([
        contractsApi.get(contractId),
        contractsApi.getMilestones(contractId),
        contractsApi.getEscrow(contractId),
        contractsApi.getPayments(contractId),
        vpoApi.getDashboard(contractId),
      ]);
      setContract(contractData);
      setMilestones(milestonesData);
      setEscrow(escrowData);
      setPayments(paymentsData);
      setDashboard(dashboardData);
      
      // Load VPO data
      const [tasksData, messagesData, submissionsData] = await Promise.all([
        vpoApi.getTasks(contractId),
        vpoApi.getMessages(contractId),
        vpoApi.getSubmissions(contractId),
      ]);
      setTasks(tasksData);
      setMessages(messagesData);
      setSubmissions(submissionsData);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load contract");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMilestone = async (milestoneId) => {
    try {
      await contractsApi.approveMilestone(milestoneId);
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to approve");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await vpoApi.sendMessage(contractId, newMessage);
      setNewMessage("");
      const messagesData = await vpoApi.getMessages(contractId);
      setMessages(messagesData);
    } catch (err) {
      alert("Failed to send message");
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      await vpoApi.createTask(contractId, newTask);
      setNewTask({ title: "", description: "", status: "todo" });
      const tasksData = await vpoApi.getTasks(contractId);
      setTasks(tasksData);
    } catch (err) {
      alert("Failed to create task");
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      await vpoApi.updateTask(contractId, taskId, { status });
      const tasksData = await vpoApi.getTasks(contractId);
      setTasks(tasksData);
    } catch (err) {
      alert("Failed to update task");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg)" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--coral)]"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen p-6" style={{ background: "var(--bg)" }}>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold">Contract not found</h3>
        </div>
      </div>
    );
  }

  const isClient = user?.role === "client";
  const isFreelancer = user?.role === "freelancer";

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/contracts")}
            className="flex items-center gap-2 text-sm text-[var(--fg-muted)] hover:text-[var(--navy)] mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Contracts
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--navy)" }}>
                {contract.job_title}
              </h1>
              <p className="text-[var(--fg-muted)] mt-1">
                Contract #{contract.ContractID} • {isClient ? `Freelancer: ${contract.freelancer_name}` : `Client: ${contract.client_name}`}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              contract.Status === "active" ? "bg-[var(--coral)]/10 text-[var(--coral)]" :
              contract.Status === "completed" ? "bg-emerald-500/10 text-emerald-500" :
              "bg-red-500/10 text-red-500"
            }`}>
              {contract.Status}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl border border-[var(--border)] p-4" style={{ background: "var(--card)" }}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-[var(--coral)]" />
              <span className="text-sm text-[var(--fg-muted)]">Total Amount</span>
            </div>
            <p className="text-xl font-bold" style={{ color: "var(--navy)" }}>
              ${contract.TotalAmount?.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] p-4" style={{ background: "var(--card)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[var(--sky)]" />
              <span className="text-sm text-[var(--fg-muted)]">Escrow Balance</span>
            </div>
            <p className="text-xl font-bold" style={{ color: "var(--navy)" }}>
              ${escrow?.escrow_balance?.toLocaleString() || "0"}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] p-4" style={{ background: "var(--card)" }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-[var(--fg-muted)]">Milestones</span>
            </div>
            <p className="text-xl font-bold" style={{ color: "var(--navy)" }}>
              {milestones.filter(m => m.Status === "approved").length} / {milestones.length}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] p-4" style={{ background: "var(--card)" }}>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-[var(--coral)]" />
              <span className="text-sm text-[var(--fg-muted)]">Messages</span>
            </div>
            <p className="text-xl font-bold" style={{ color: "var(--navy)" }}>
              {dashboard?.total_messages || 0}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: Briefcase },
            { id: "milestones", label: "Milestones", icon: CheckCircle },
            { id: "tasks", label: "Kanban", icon: FolderKanban },
            { id: "chat", label: "Chat", icon: MessageSquare },
            { id: "submissions", label: "Submissions", icon: Send },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[var(--navy)] text-white"
                  : "bg-[var(--card)] text-[var(--fg-muted)] hover:text-[var(--navy)]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--border)] p-6" style={{ background: "var(--card)" }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--navy)" }}>
                Contract Overview
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[var(--fg-muted)]">Job ID</p>
                  <p className="font-medium">{contract.JobID}</p>
                </div>
                <div>
                  <p className="text-[var(--fg-muted)]">Freelancer</p>
                  <p className="font-medium">{contract.freelancer_name}</p>
                </div>
                <div>
                  <p className="text-[var(--fg-muted)]">Client</p>
                  <p className="font-medium">{contract.client_name}</p>
                </div>
                <div>
                  <p className="text-[var(--fg-muted)]">Created</p>
                  <p className="font-medium">{new Date(contract.CreatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl border border-[var(--border)] p-6" style={{ background: "var(--card)" }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--navy)" }}>
                Recent Activity
              </h3>
              <div className="space-y-3">
                {payments.slice(0, 5).map((payment, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg)]">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        payment.EventType === "escrow_deposit" ? "bg-emerald-500/10" : "bg-[var(--coral)]/10"
                      }`}>
                        <DollarSign className={`w-4 h-4 ${
                          payment.EventType === "escrow_deposit" ? "text-emerald-500" : "text-[var(--coral)]"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {payment.EventType === "escrow_deposit" ? "Escrow Deposit" : "Payment Released"}
                        </p>
                        <p className="text-xs text-[var(--fg-muted)]">
                          {new Date(payment.ProcessedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold" style={{ color: "var(--navy)" }}>
                      ${payment.Amount?.toLocaleString()}
                    </span>
                  </div>
                ))}
                {payments.length === 0 && (
                  <p className="text-sm text-[var(--fg-muted)]">No payment activity yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "milestones" && (
          <div className="space-y-4">
            {isClient && (
              <div className="rounded-2xl border border-[var(--border)] p-6" style={{ background: "var(--card)" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--navy)" }}>
                  Add Milestone
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Milestone title"
                    className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
                    onChange={(e) => {}} // Add state management
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
                    onChange={(e) => {}} // Add state management
                  />
                  <button
                    className="rounded-xl px-4 py-2 text-sm font-medium text-white"
                    style={{ background: "var(--navy)" }}
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Milestone
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div
                  key={milestone.MilestoneID}
                  className="rounded-2xl border border-[var(--border)] p-6"
                  style={{ background: "var(--card)" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold" style={{ color: "var(--navy)" }}>
                        {milestone.Title}
                      </h4>
                      <p className="text-sm text-[var(--fg-muted)] mt-1">
                        ${milestone.Amount?.toLocaleString()} • Due: {milestone.DueDate ? new Date(milestone.DueDate).toLocaleDateString() : "No due date"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        milestone.Status === "approved" ? "bg-emerald-500/10 text-emerald-500" :
                        milestone.Status === "pending" ? "bg-[var(--sky)]/10 text-[var(--sky)]" :
                        "bg-red-500/10 text-red-500"
                      }`}>
                        {milestone.Status}
                      </span>
                      {isClient && milestone.Status === "pending" && (
                        <button
                          onClick={() => handleApproveMilestone(milestone.MilestoneID)}
                          className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                          style={{ background: "var(--coral)" }}
                        >
                          Approve & Pay
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {milestones.length === 0 && (
                <p className="text-center text-sm text-[var(--fg-muted)] py-8">No milestones yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["todo", "in_progress", "done"].map((status) => (
                <div key={status} className="rounded-2xl border border-[var(--border)] p-4" style={{ background: "var(--card)" }}>
                  <h4 className="font-semibold mb-3 capitalize" style={{ color: "var(--navy)" }}>
                    {status.replace("_", " ")}
                  </h4>
                  <div className="space-y-2">
                    {tasks.filter(t => t.status === status).map((task) => (
                      <div
                        key={task.task_id}
                        className="p-3 rounded-xl bg-[var(--bg)] cursor-pointer hover:shadow-md transition-all"
                        onClick={() => handleUpdateTaskStatus(task.task_id, status === "todo" ? "in_progress" : "done")}
                      >
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-[var(--fg-muted)] mt-1">{task.description}</p>
                      </div>
                    ))}
                    <button
                      onClick={() => setNewTask({ ...newTask, status })}
                      className="w-full p-2 rounded-xl border border-dashed border-[var(--border)] text-sm text-[var(--fg-muted)] hover:text-[var(--navy)]"
                    >
                      <Plus className="w-4 h-4 inline mr-1" />
                      Add Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="rounded-2xl border border-[var(--border)] p-6" style={{ background: "var(--card)" }}>
            <div className="h-96 overflow-y-auto space-y-4 mb-4">
              {messages.map((msg) => (
                <div
                  key={msg.msg_id}
                  className={`flex ${msg.sender_id === user?.user_id ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] p-3 rounded-2xl ${
                    msg.sender_id === user?.user_id
                      ? "bg-[var(--navy)] text-white"
                      : "bg-[var(--bg)]"
                  }`}>
                    <p className="text-xs font-medium mb-1">{msg.sender_name}</p>
                    <p className="text-sm">{msg.body}</p>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-center text-sm text-[var(--fg-muted)] py-8">No messages yet</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                style={{ background: "var(--coral)" }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeTab === "submissions" && (
          <div className="space-y-4">
            {isFreelancer && (
              <div className="rounded-2xl border border-[var(--border)] p-6" style={{ background: "var(--card)" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--navy)" }}>
                  Submit Work
                </h3>
                <textarea
                  placeholder="Describe your submission..."
                  className="w-full rounded-xl border border-[var(--border)] px-4 py-2 text-sm mb-3"
                  rows={3}
                />
                <button
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                  style={{ background: "var(--navy)" }}
                >
                  <Send className="w-4 h-4 inline mr-2" />
                  Submit for Review
                </button>
              </div>
            )}

            <div className="space-y-3">
              {submissions.map((sub) => (
                <div
                  key={sub.submission_id}
                  className="rounded-2xl border border-[var(--border)] p-6"
                  style={{ background: "var(--card)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold" style={{ color: "var(--navy)" }}>
                      Version {sub.version}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      sub.fraud_status === "flagged" ? "bg-red-500/10 text-red-500" :
                      sub.fraud_status === "cleared" ? "bg-emerald-500/10 text-emerald-500" :
                      "bg-[var(--sky)]/10 text-[var(--sky)]"
                    }`}>
                      {sub.fraud_status || "pending"}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--fg-muted)] mb-3">{sub.text_content}</p>
                  {sub.ai_score !== null && (
                    <p className="text-xs text-[var(--fg-muted)]">
                      AI Score: {(sub.ai_score * 100).toFixed(1)}%
                    </p>
                  )}
                  {sub.fraud_flags?.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-red-500/5">
                      <p className="text-xs font-medium text-red-500 mb-1">Fraud Flags:</p>
                      {sub.fraud_flags.map((flag, idx) => (
                        <p key={idx} className="text-xs text-red-400">
                          • {flag.type} ({(flag.confidence * 100).toFixed(1)}%)
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {submissions.length === 0 && (
                <p className="text-center text-sm text-[var(--fg-muted)] py-8">No submissions yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}