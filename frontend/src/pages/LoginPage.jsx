import React from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import LoginForm from "../components/authentication/form/LoginForm";

export default function LoginPage() {
  const navigate = useNavigate();

  async function handleLogin({ email, password }) {
    authApi.clearAuth();
    const data = await authApi.login({ email, password });
    if (data?.access_token) {
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("role", data.role);
      navigate(data.role === "freelancer" ? "/dashboard/freelancer" : "/dashboard/client");
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm
          onSubmit={handleLogin}
          onSwitch={() => navigate("/signup")}
          onForgot={() => alert("Forgot password flow")}
        />
      </div>
    </div>
  );
}