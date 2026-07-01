import { useEffect, useState } from "react";
import { api, GymOption } from "../api";

export default function Gyms() {
  const [gyms, setGyms] = useState<GymOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getGyms()
      .then((res) => setGyms(res.gyms))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <div className="page-head">
        <span className="section-kicker">Memberships</span>
        <h1>Gyms across India</h1>
        <p style={{ maxWidth: 600, marginTop: 16 }}>
          Compare major fitness chains and pick one that matches your program. Pricing varies by
          city and location — figures below are indicative starting ranges.
        </p>
      </div>

      {loading ? (
        <div className="loading-block">
          <p>Loading gyms…</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {gyms.map((gym) => (
            <div className="gym-card" key={gym.id}>
              <div className="gym-name">{gym.name}</div>
              <div className="price">{gym.priceRange}</div>
              <p style={{ margin: 0, fontSize: 14 }}>{gym.city}</p>
              <ul>
                {gym.perks.map((perk, i) => (
                  <li key={i}>{perk}</li>
                ))}
              </ul>
              <a className="btn btn-outline" href={gym.link} target="_blank" rel="noreferrer">
                View plans
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
