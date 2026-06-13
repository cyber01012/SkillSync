import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import BaselineChallenge from "./pages/BaselineChallenge";
import { authApi } from "./api/auth";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  console.log("ProtectedRoute - Debug:", { token, role, allowedRole });

  if (!token) {
    console.log("ProtectedRoute - No token, redirecting to /login");
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole && role !== allowedRole) {
    console.log("ProtectedRoute - Role mismatch, redirecting to dashboard");
    // Redirect to their actual dashboard if role doesn't match the required one
    const dashboardRoute = role === "freelancer" ? "/dashboard/freelancer" : "/dashboard/client";
    return <Navigate to={dashboardRoute} replace />;
  }

  return children;
}

function CatchAll() {
  console.log("CatchAll route hit, current path:", window.location.pathname);
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected: Freelancer only */}
        <Route
          path="/dashboard/freelancer"
          element={
            <ProtectedRoute allowedRole="freelancer">
              <FreelancerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected: Client only */}
        <Route
          path="/dashboard/client"
          element={
            <ProtectedRoute allowedRole="client">
              <ClientDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected: Baseline challenge (freelancer) */}
        <Route
          path="/baseline-challenge"
          element={
            <ProtectedRoute allowedRole="freelancer">
              <BaselineChallenge />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<CatchAll />} />
      </Routes>
    </BrowserRouter>
  );
}