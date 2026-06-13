import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import RoleSelection from "../components/authentication/RoleSelection";
import SignupForm from "../components/authentication/form/SignupForm";

export default function SignupPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  async function handleSignup(payload) {
    const data = await authApi.signup(payload);
    if (data?.access_token) {
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("role", data.role);
      navigate(data.role === "freelancer" ? "/dashboard/freelancer" : "/dashboard/client");
    }
  }

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-[#FFF8F5]">
        <RoleSelection
          onSelectRole={setSelectedRole}
          onLoginClick={() => navigate("/login")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignupForm
          onSubmit={handleSignup}
          initialRole={selectedRole}
          onSwitch={() => {
            setSelectedRole(null);
            navigate("/login");
          }}
          onCheckUsernameUnique={async (username) => true}
        />
      </div>
    </div>
  );
}