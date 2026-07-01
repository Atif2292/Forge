import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, ApiError, Plan, Profile } from "../api";

function bmiCategory(bmi: number) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy range";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, planRes] = await Promise.all([api.getProfile(), api.getPlan()]);
        if (!profileRes.profile) {
          navigate("/onboarding");
          return;
        }
        setProfile(profileRes.profile);
        setPlan(planRes.plan);

        const shouldGenerate = searchParams.get("generate") === "1";
        if (shouldGenerate || !planRes.plan) {
          setSearchParams({}, { replace: true });
          await runGenerate();
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runGenerate() {
    setGenerating(true);
    setError("");
    try {
      const res = await api.generatePlan();
      setPlan(res.plan);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not generate plan");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="page-head">
          <h1>Loading your dashboard…</h1>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container">
      <div className="page-head">
        <span className="section-kicker">Your Dashboard</span>
        <h1>Stats & AI Plan</h1>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="label">BMI</div>
          <div className="value">{profile.bmi.toFixed(1)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Category</div>
          <div className="value" style={{ fontSize: 20 }}>
            {bmiCategory(profile.bmi)}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Current Weight</div>
          <div className="value">{profile.weightKg} kg</div>
        </div>
        <div className="stat-card">
          <div className="label">Target Weight</div>
          <div className="value">{profile.targetWeightKg} kg</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 26 }}>Your Plan</h2>
        <button className="btn" onClick={runGenerate} disabled={generating}>
          {generating ? "Generating…" : plan ? "Regenerate Plan" : "Generate Plan"}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {generating && (
        <div className="loading-block">
          <p>Calling the AI coach — building a routine tuned to your goal…</p>
        </div>
      )}

      {!generating && plan && (
        <div className="plan-block">
          <span className="badge">{plan.programType}</span>
          <h3 style={{ marginTop: 12 }}>{plan.summary}</h3>
          <p className="meta">Generated {new Date(plan.createdAt).toLocaleString()}</p>

          {plan.weeklySchedule.map((day) => (
            <div className="plan-day" key={day.day}>
              <div className="plan-day-title">
                {day.day} — {day.focus}
              </div>
              <ul>
                {day.exercises.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>
          ))}

          {plan.nutritionTips?.length > 0 && (
            <div className="plan-day">
              <div className="plan-day-title">Nutrition Tips</div>
              <ul>
                {plan.nutritionTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!generating && !plan && !error && (
        <div className="loading-block">
          <p>No plan yet. Click "Generate Plan" to get your first AI-built routine.</p>
        </div>
      )}
    </div>
  );
}
