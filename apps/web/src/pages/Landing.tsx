import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { user } = useAuth();

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="hero-tag">AI-Generated Training Plans</span>
          <h1>
            Train <span>smarter.</span>
            <br />
            Not just harder.
          </h1>
          <p className="lede">
            Log your stats, tell us your goal, and get a personalized weightlifting,
            powerlifting, or HIIT program in seconds — built by AI, tuned to your body.
          </p>
          <div className="hero-actions">
            <Link className="btn" to={user ? "/onboarding" : "/signup"}>
              Build My Plan
            </Link>
            <Link className="btn btn-outline" to="/gyms">
              Compare Gyms
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="section-kicker">How it works</span>
            <h2 style={{ fontSize: 40 }}>Three steps to your plan</h2>
          </div>
          <div className="grid grid-3">
            <div className="card">
              <div className="num">01</div>
              <h3>Log your data</h3>
              <p>Height, weight, target weight, age, and activity level — takes under a minute.</p>
            </div>
            <div className="card">
              <div className="num">02</div>
              <h3>AI builds your plan</h3>
              <p>We send your profile to an LLM that generates a structured weekly routine.</p>
            </div>
            <div className="card">
              <div className="num">03</div>
              <h3>Pick a gym & go</h3>
              <p>Compare memberships at Cult.fit, Anytime Fitness, Gold's Gym and more.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ borderBottom: "none" }}>
        <div className="container">
          <div className="section-head">
            <span className="section-kicker">Programs</span>
            <h2 style={{ fontSize: 40 }}>Every training style, covered</h2>
          </div>
          <div className="grid grid-2">
            {[
              ["Weightlifting", "Hypertrophy-focused splits to build size and strength."],
              ["Powerlifting", "Squat / bench / deadlift progression built around your 1RM goals."],
              ["HIIT", "High-intensity intervals for fat loss and conditioning."],
              ["Hybrid / General Fitness", "A balanced mix for overall health and mobility."],
            ].map(([title, desc]) => (
              <div className="card" key={title}>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
