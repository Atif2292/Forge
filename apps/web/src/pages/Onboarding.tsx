import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../api";

export default function Onboarding() {
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
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
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
      navigate("/dashboard?generate=1");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save profile");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="page-head">
        <span className="section-kicker">Step 1 of 1</span>
        <h1>Tell us about your body</h1>
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
                min={100}
                max={250}
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
                min={13}
                max={100}
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
                min={30}
                max={300}
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
                min={30}
                max={300}
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
                <option value="sedentary">Sedentary (desk job, little exercise)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="athlete">Athlete (2x/day training)</option>
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
          <button className="btn btn-block" type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Generate My Plan"}
          </button>
        </form>
      </div>
    </div>
  );
}
