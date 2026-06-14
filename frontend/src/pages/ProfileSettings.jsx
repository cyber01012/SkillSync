import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileApi } from "../api/profile";
import { authApi } from "../api/auth";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ display_name: "", headline: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    profileApi.get().then((p) => {
      setProfile(p);
      setForm({ display_name: p.DisplayName || "", headline: p.Headline || "", bio: p.Bio || "" });
    });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await profileApi.update(form);
      setMessage("Profile updated successfully");
    } catch {
      setMessage("Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await profileApi.uploadPhoto(file);
      const p = await profileApi.get();
      setProfile(p);
      setMessage("Photo uploaded");
    } catch {
      setMessage("Photo upload failed");
    }
  }

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-lg mx-auto">
        <button type="button" onClick={() => navigate("/dashboard/freelancer")} className="btn-ghost mb-4">
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-black text-[var(--fg-primary)] mb-6">Profile Settings</h1>

        <form onSubmit={handleSave} className="rounded-2xl border border-[var(--border)] p-6 space-y-4" style={{ background: "var(--card)" }}>
          <div>
            <label className="label">Profile Photo</label>
            <input type="file" accept="image/*" onChange={handlePhoto} className="input" />
          </div>
          <div>
            <label className="label">Display Name</label>
            <input className="input" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
          </div>
          <div>
            <label className="label">Headline</label>
            <input className="input" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
          </div>
          <div>
            <label className="label">Bio (max 500 chars)</label>
            <textarea
              className="input min-h-[100px]"
              maxLength={500}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
            <p className="text-xs text-[var(--fg-muted)] mt-1">{form.bio.length}/500</p>
          </div>
          {message && <p className="text-sm text-emerald-600">{message}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
