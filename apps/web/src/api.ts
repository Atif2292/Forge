const BASE = import.meta.env.VITE_API_BASE_URL || "/api";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("forge_token");
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(body?.error || "Something went wrong", res.status);
  }
  return body as T;
}

export interface AuthResponse {
  token: string;
  user: { id: number; name: string; email: string };
}

export interface Profile {
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  age: number;
  gender: string;
  activityLevel: string;
  goal: string;
  preferredProgram: string;
  bmi: number;
}

export interface PlanDay {
  day: string;
  focus: string;
  exercises: string[];
}

export interface Plan {
  id: number;
  summary: string;
  programType: string;
  weeklySchedule: PlanDay[];
  nutritionTips: string[];
  createdAt: string;
}

export const api = {
  signup: (name: string, email: string, password: string) =>
    request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ user: { id: number; name: string; email: string } }>("/auth/me"),
  saveProfile: (profile: Omit<Profile, "bmi">) =>
    request<{ profile: Profile }>("/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    }),
  getProfile: () => request<{ profile: Profile | null }>("/profile"),
  generatePlan: () => request<{ plan: Plan }>("/plan/generate", { method: "POST" }),
  getPlan: () => request<{ plan: Plan | null }>("/plan"),
  getGyms: () => request<{ gyms: GymOption[] }>("/gyms"),
};

export interface GymOption {
  id: string;
  name: string;
  city: string;
  priceRange: string;
  perks: string[];
  link: string;
}

export { ApiError };
