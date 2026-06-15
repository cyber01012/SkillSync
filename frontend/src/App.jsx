import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import BaselineChallenge from "./pages/BaselineChallenge";
import CategorySelection from "./pages/CategorySelection";
import ProfileSettings from "./pages/ProfileSettings";
import JobBrowser from "./pages/JobBrowser";
import PostJob from "./pages/PostJob";
import JobDetail from "./pages/JobDetail";
import MyApplications from "./pages/MyApplications";
import Contracts from "./pages/Contracts";
import ContractDetail from "./pages/ContractDetail";
import MyJobs from "./pages/MyJobs";
import Applicants from "./pages/Applicants";
import Payments from "./pages/Payments";
import Analytics from "./pages/Analytics";
import Earnings from "./pages/Earnings";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    const dashboardRoute = role === "freelancer" ? "/dashboard/freelancer" : "/dashboard/client";
    return <Navigate to={dashboardRoute} replace />;
  }

  return children;
}

function FreelancerOnboardingRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;
  if (role !== "freelancer") return <Navigate to="/dashboard/client" replace />;

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Freelancer */}
        <Route path="/dashboard/freelancer" element={<ProtectedRoute allowedRole="freelancer"><FreelancerDashboard /></ProtectedRoute>} />
        <Route path="/baseline-challenge" element={<FreelancerOnboardingRoute><BaselineChallenge /></FreelancerOnboardingRoute>} />
        <Route path="/category-selection" element={<FreelancerOnboardingRoute><CategorySelection /></FreelancerOnboardingRoute>} />
        <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute allowedRole="freelancer"><JobBrowser /></ProtectedRoute>} />
        <Route path="/jobs/:jobId" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute allowedRole="freelancer"><MyApplications /></ProtectedRoute>} />
        <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
        <Route path="/contracts/:contractId" element={<ProtectedRoute><ContractDetail /></ProtectedRoute>} />
        <Route path="/earnings" element={<ProtectedRoute allowedRole="freelancer"><Earnings /></ProtectedRoute>} />

        {/* Client */}
        <Route path="/dashboard/client" element={<ProtectedRoute allowedRole="client"><ClientDashboard /></ProtectedRoute>} />
        <Route path="/post-job" element={<ProtectedRoute allowedRole="client"><PostJob /></ProtectedRoute>} />
        <Route path="/my-jobs" element={<ProtectedRoute allowedRole="client"><MyJobs /></ProtectedRoute>} />
        <Route path="/applicants" element={<ProtectedRoute allowedRole="client"><Applicants /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute allowedRole="client"><Payments /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute allowedRole="client"><Analytics /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}