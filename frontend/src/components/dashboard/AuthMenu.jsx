import React, { useState, useRef, useEffect } from "react";
import { User, Lock, LogOut, LogOutIcon, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth";

export default function AuthMenu({ user, role = "freelancer" }) {
  const [open, setOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await authApi.logout();
    authApi.clearAuth();
    window.location.href = "/";
  }

  async function handleLogoutAll() {
    await authApi.logoutAll();
    authApi.clearAuth();
    window.location.href = "/";
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError("");
    if (passwordForm.newPass.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError("Passwords do not match");
      return;
    }
    try {
      await authApi.changePassword({
        current_password: passwordForm.current,
        new_password: passwordForm.newPass,
      });
      setPasswordSuccess(true);
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
        setPasswordForm({ current: "", newPass: "", confirm: "" });
      }, 1500);
    } catch (err) {
      setPasswordError(err?.response?.data?.detail || "Failed to change password");
    }
  }

  const displayName = user?.DisplayName || user?.Email || "User";

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 p-2 rounded-xl hover:bg-[var(--muted)] transition"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--ui-primary-50)] flex items-center justify-center">
            <User size={16} className="text-[var(--ui-primary)]" />
          </div>
          <span className="text-sm font-semibold text-[var(--fg-primary)] hidden md:block">
            {displayName}
          </span>
        </button>

        {open && (
          <div className="absolute bottom-full left-0 mb-2 w-56 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg z-50 py-2">
            <div className="px-4 py-2 border-b border-[var(--border)]">
              <p className="font-semibold text-[var(--fg-primary)] text-sm">{displayName}</p>
              <p className="text-xs text-[var(--fg-muted)]">{user?.email || user?.Email}</p>
            </div>
            {role === "freelancer" && (
              <button
                type="button"
                onClick={() => { navigate("/profile-settings"); setOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--fg-primary)] hover:bg-[var(--muted)]"
              >
                <Settings size={16} /> Profile Settings
              </button>
            )}
            <button
              type="button"
              onClick={() => { setShowPasswordModal(true); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--fg-primary)] hover:bg-[var(--muted)]"
            >
              <Lock size={16} /> Change Password
            </button>
            <div className="border-t border-[var(--border)] mt-1 pt-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--fg-primary)] hover:bg-[var(--muted)]"
              >
                <LogOut size={16} /> Log Out
              </button>
              <button
                type="button"
                onClick={handleLogoutAll}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--fg-muted)] hover:bg-[var(--muted)]"
              >
                <LogOutIcon size={16} /> Log Out All Devices
              </button>
            </div>
          </div>
        )}
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleChangePassword}
            className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-black text-[var(--fg-primary)] mb-4">Change Password</h3>
            {passwordSuccess ? (
              <p className="text-emerald-600 font-semibold">Password changed successfully!</p>
            ) : (
              <>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Current Password"
                    className="input"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    required
                  />
                  <input
                    type="password"
                    placeholder="New Password (min 8 chars)"
                    className="input"
                    value={passwordForm.newPass}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                    required
                    minLength={8}
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="input"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    required
                  />
                </div>
                {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="btn-primary flex-1">Update</button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </>
  );
}
