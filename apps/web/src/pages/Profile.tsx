import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../api";

export default function Profile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    heightCm: "",
    weightKg: "",
    targetWeightKg: "",
    age: "",
    gender: "male",
    activityLevel: "moderate",
    goal: "fat_loss",
    preferredProgram: "weightlifting",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .getProfile()
      .then((res) => {
        if (!res.profile) {
          navigate("/onboarding");
          return;
        }
        const p = res.profile;
        setForm({
          heightCm: String(p.heightCm),
          weightKg: String(p.weightKg),
          targetWeightKg: String(p.targetWeightKg),
          age: String(p.age),
          gender: p.gender,
          activityLevel: p.activityLevel,
          goal: p.goal,
          preferredProgram: p.preferredProgram,
        });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.saveProfile({
        heightCm: Number(form.heightCm),
        weightKg: Number(form.weightKg),
        targetWeightKg: Number(form.targetWeightKg),
        age: Number(form.age),
        gender: form.gender,
        activityLevel: form.activityLevel,
        goal: form.goal,
        preferredProgram: form.preferredProgram,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save profile");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="page-head">
          <h1>Loading…</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-head">
        <span className="section-kicker">Your Profile</span>
        <h1>Update your data</h1>
      </div>
      <div className="auth-shell" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-row-grid">
            <div className="form-row">
              <label htmlFor="height">Height (cm)</label>
              <input
                id="height"
                type="number"
                required
                value={form.heightCm}
                onChange={(e) => update("heightCm", e.target.value)}
              />
            </div>
            <div className="form-row">
              <label htmlFor="age">Age</label>
              <input
                id="age"
                type="number"
                required
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
              />
            </div>
          </div>
          <div className="form-row-grid">
            <div className="form-row">
              <label htmlFor="weight">Current weight (kg)</label>
              <input
                id="weight"
                type="number"
                required
                value={form.weightKg}
                onChange={(e) => update("weightKg", e.target.value)}
              />
            </div>
            <div className="form-row">
              <label htmlFor="targetWeight">Target weight (kg)</label>
              <input
                id="targetWeight"
                type="number"
                required
                value={form.targetWeightKg}
                onChange={(e) => update("targetWeightKg", e.target.value)}
              />
            </div>
          </div>
          <div className="form-row-grid">
            <div className="form-row">
              <label htmlFor="gender">Gender</label>
              <select id="gender" value={form.gender} onChange={(e) => update("gender", e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="activity">Activity level</label>
              <select
                id="activity"
                value={form.activityLevel}
                onChange={(e) => update("activityLevel", e.target.value)}
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
                <option value="athlete">Athlete</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <label htmlFor="goal">Primary goal</label>
            <select id="goal" value={form.goal} onChange={(e) => update("goal", e.target.value)}>
              <option value="fat_loss">Fat loss</option>
              <option value="muscle_gain">Muscle gain</option>
              <option value="strength">Raw strength</option>
              <option value="endurance">Endurance / conditioning</option>
              <option value="maintenance">General maintenance</option>
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="program">Preferred program</label>
            <select
              id="program"
              value={form.preferredProgram}
              onChange={(e) => update("preferredProgram", e.target.value)}
            >
              <option value="weightlifting">Weightlifting</option>
              <option value="powerlifting">Powerlifting</option>
              <option value="hiit">HIIT</option>
              <option value="hybrid">Hybrid / General Fitness</option>
              <option value="calisthenics">Calisthenics</option>
            </select>
          </div>
          {error && <p className="error-text">{error}</p>}
          {saved && <p className="hint" style={{ color: "var(--volt)" }}>Saved. Head to your dashboard and regenerate your plan to reflect changes.</p>}
          <button className="btn btn-block" type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
