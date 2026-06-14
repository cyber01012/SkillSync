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
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/dashboard/freelancer"
          element={
            <ProtectedRoute allowedRole="freelancer">
              <FreelancerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/client"
          element={
            <ProtectedRoute allowedRole="client">
              <ClientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/category-selection"
          element={
            <FreelancerOnboardingRoute>
              <CategorySelection />
            </FreelancerOnboardingRoute>
          }
        />

        <Route
          path="/baseline-challenge"
          element={
            <FreelancerOnboardingRoute>
              <BaselineChallenge />
            </FreelancerOnboardingRoute>
          }
        />

        <Route
          path="/profile-settings"
          element={
            <ProtectedRoute allowedRole="freelancer">
              <ProfileSettings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs"
          element={
            <ProtectedRoute allowedRole="freelancer">
              <JobBrowser />
            </ProtectedRoute>
          }
        />

        <Route
          path="/post-job"
          element={
            <ProtectedRoute allowedRole="client">
              <PostJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs/:jobId"
          element={
            <ProtectedRoute>
              <JobDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRole="freelancer">
              <MyApplications />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
