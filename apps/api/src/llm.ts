import type { GeneratedPlan, ProfileData } from "./types.js";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Free-tier models on OpenRouter, tried in order. No credit card required to get a key:
// https://openrouter.ai/keys
const FREE_MODELS = [
  process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
];

function bmi(profile: ProfileData): number {
  const heightM = profile.heightCm / 100;
  return profile.weightKg / (heightM * heightM);
}

function buildPrompt(profile: ProfileData): { system: string; user: string } {
  const system = `You are a certified strength & conditioning coach. You design safe, structured weekly training plans.
You must respond with ONLY valid JSON, no markdown fences, no commentary, matching exactly this shape:
{
  "summary": string (2-3 sentences describing the plan and why it fits the user),
  "programType": string (one of: Weightlifting, Powerlifting, HIIT, Hybrid / General Fitness, Calisthenics),
  "weeklySchedule": [
    { "day": string, "focus": string, "exercises": string[] }
  ],
  "nutritionTips": string[] (4-6 short, practical tips)
}
The weeklySchedule must have 5-6 entries covering the week, including at least one rest/active-recovery day. Each exercise entry should include sets/reps or duration where relevant.`;

  const user = `User profile:
- Height: ${profile.heightCm} cm
- Weight: ${profile.weightKg} kg
- Target weight: ${profile.targetWeightKg} kg
- BMI: ${bmi(profile).toFixed(1)}
- Age: ${profile.age}
- Gender: ${profile.gender}
- Activity level: ${profile.activityLevel}
- Primary goal: ${profile.goal}
- Preferred training style: ${profile.preferredProgram}

Design a personalized weekly training plan for this person, centered on their preferred style (${profile.preferredProgram}), aligned with their goal (${profile.goal}). Respond with ONLY the JSON object described in the system prompt.`;

  return { system, user };
}

function extractJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in model response");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function isValidPlan(value: unknown): value is GeneratedPlan {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.summary === "string" &&
    typeof v.programType === "string" &&
    Array.isArray(v.weeklySchedule) &&
    v.weeklySchedule.length > 0 &&
    Array.isArray(v.nutritionTips)
  );
}

async function callModel(model: string, profile: ProfileData): Promise<GeneratedPlan> {
  const { system, user } = buildPrompt(profile);
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter request failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Empty response from model");

  const parsed = extractJson(content);
  if (!isValidPlan(parsed)) throw new Error("Model response did not match expected plan shape");
  return parsed;
}

function fallbackPlan(profile: ProfileData): GeneratedPlan {
  const programLabels: Record<string, string> = {
    weightlifting: "Weightlifting",
    powerlifting: "Powerlifting",
    hiit: "HIIT",
    hybrid: "Hybrid / General Fitness",
    calisthenics: "Calisthenics",
  };
  const programType = programLabels[profile.preferredProgram] || "Hybrid / General Fitness";

  const templates: Record<string, GeneratedPlan["weeklySchedule"]> = {
    weightlifting: [
      { day: "Monday", focus: "Push (Chest/Shoulders/Triceps)", exercises: ["Bench press 4x8", "Overhead press 3x10", "Incline dumbbell press 3x10", "Lateral raises 3x15", "Triceps pushdowns 3x12"] },
      { day: "Tuesday", focus: "Pull (Back/Biceps)", exercises: ["Deadlift 4x6", "Lat pulldown 3x10", "Barbell row 3x10", "Face pulls 3x15", "Barbell curls 3x12"] },
      { day: "Wednesday", focus: "Rest / Active Recovery", exercises: ["20-30 min light walk", "Mobility & stretching"] },
      { day: "Thursday", focus: "Legs", exercises: ["Back squat 4x8", "Romanian deadlift 3x10", "Leg press 3x12", "Calf raises 4x15"] },
      { day: "Friday", focus: "Upper Body Accessory", exercises: ["Incline bench 3x10", "Seated cable row 3x12", "Dumbbell shoulder press 3x10", "Cable curls 3x12"] },
      { day: "Saturday", focus: "Conditioning", exercises: ["20 min steady-state cardio", "Core circuit: plank, dead bug, cable crunch"] },
      { day: "Sunday", focus: "Rest", exercises: ["Full rest day"] },
    ],
    powerlifting: [
      { day: "Monday", focus: "Squat Day", exercises: ["Back squat 5x5 @ 75%", "Front squat 3x5", "Leg press 3x8", "Weighted plank 3x45s"] },
      { day: "Tuesday", focus: "Bench Day", exercises: ["Bench press 5x5 @ 75%", "Close-grip bench 3x8", "Dumbbell row 3x10", "Triceps dips 3x10"] },
      { day: "Wednesday", focus: "Rest", exercises: ["Mobility work", "Light walk"] },
      { day: "Thursday", focus: "Deadlift Day", exercises: ["Deadlift 5x3 @ 80%", "Deficit deadlifts 3x5", "Barbell row 3x8", "Hanging leg raise 3x12"] },
      { day: "Friday", focus: "Accessory / Weak Point", exercises: ["Pause squat 3x5", "Overhead press 3x8", "Pull-ups 3x8", "Core circuit"] },
      { day: "Saturday", focus: "Technique & Light Conditioning", exercises: ["Bar-only technique work all 3 lifts", "15 min incline walk"] },
      { day: "Sunday", focus: "Rest", exercises: ["Full rest day"] },
    ],
    hiit: [
      { day: "Monday", focus: "Full Body HIIT", exercises: ["8 rounds: 30s burpees / 30s rest", "8 rounds: 30s mountain climbers / 30s rest", "Cooldown stretch"] },
      { day: "Tuesday", focus: "Strength Circuit", exercises: ["4 rounds: 12 goblet squats, 12 push-ups, 12 kettlebell swings", "Rest 90s between rounds"] },
      { day: "Wednesday", focus: "Active Recovery", exercises: ["30 min brisk walk or light cycling", "Stretching"] },
      { day: "Thursday", focus: "Tabata Intervals", exercises: ["8 rounds: 20s max effort jump squats / 10s rest", "8 rounds: 20s battle ropes / 10s rest"] },
      { day: "Friday", focus: "Metabolic Conditioning", exercises: ["5 rounds: 400m run, 15 air squats, 10 push-ups"] },
      { day: "Saturday", focus: "Core & Mobility", exercises: ["3 rounds: plank 45s, bicycle crunches 20, leg raises 15", "Full body mobility flow"] },
      { day: "Sunday", focus: "Rest", exercises: ["Full rest day"] },
    ],
    calisthenics: [
      { day: "Monday", focus: "Push", exercises: ["Push-up progressions 4x max", "Dips 3x10", "Pike push-ups 3x10", "Plank 3x45s"] },
      { day: "Tuesday", focus: "Pull", exercises: ["Pull-up progressions 4x max", "Australian rows 3x12", "Chin-ups 3x8"] },
      { day: "Wednesday", focus: "Rest", exercises: ["Mobility flow", "Light walk"] },
      { day: "Thursday", focus: "Legs", exercises: ["Pistol squat progressions 4x8", "Bulgarian split squats 3x10", "Glute bridges 3x15"] },
      { day: "Friday", focus: "Skill Work", exercises: ["Handstand practice 15 min", "L-sit holds 5x15s", "Core circuit"] },
      { day: "Saturday", focus: "Full Body Flow", exercises: ["Circuit: 10 burpees, 10 push-ups, 10 squats x5 rounds"] },
      { day: "Sunday", focus: "Rest", exercises: ["Full rest day"] },
    ],
    hybrid: [
      { day: "Monday", focus: "Strength (Upper)", exercises: ["Bench press 3x10", "Dumbbell row 3x10", "Shoulder press 3x10"] },
      { day: "Tuesday", focus: "Cardio + Core", exercises: ["25 min steady cardio", "Core circuit 3 rounds"] },
      { day: "Wednesday", focus: "Rest / Mobility", exercises: ["Stretching", "Foam rolling"] },
      { day: "Thursday", focus: "Strength (Lower)", exercises: ["Squats 3x10", "Romanian deadlift 3x10", "Walking lunges 3x12"] },
      { day: "Friday", focus: "HIIT Circuit", exercises: ["6 rounds: 30s jump rope / 30s rest", "4 rounds: bodyweight squats + push-ups"] },
      { day: "Saturday", focus: "Active Recovery", exercises: ["Light hike or swim", "Mobility flow"] },
      { day: "Sunday", focus: "Rest", exercises: ["Full rest day"] },
    ],
  };

  const weeklySchedule = templates[profile.preferredProgram] || templates.hybrid;

  return {
    summary: `A ${programType.toLowerCase()} plan built around your goal of ${profile.goal.replace("_", " ")}, tuned to a ${profile.activityLevel} activity level. (Generated locally — connect an OPENROUTER_API_KEY for live AI-personalized plans.)`,
    programType,
    weeklySchedule,
    nutritionTips: [
      "Prioritize protein at each meal (roughly 1.6-2.2g per kg bodyweight per day).",
      "Stay in a moderate calorie deficit for fat loss or surplus for muscle gain — avoid extremes.",
      "Hydrate well: aim for 3+ liters of water daily, more on training days.",
      "Get 7-9 hours of sleep for recovery and hormonal balance.",
      "Eat whole, minimally processed foods most of the time; track progress weekly, not daily.",
    ],
  };
}

export async function generatePlan(profile: ProfileData): Promise<GeneratedPlan> {
  if (process.env.OPENROUTER_API_KEY) {
    for (const model of FREE_MODELS) {
      try {
        return await callModel(model, profile);
      } catch (err) {
        console.warn(`[llm] model ${model} failed:`, (err as Error).message);
      }
    }
    console.warn("[llm] all OpenRouter models failed, falling back to local plan generator");
  } else {
    console.warn("[llm] OPENROUTER_API_KEY not set, using local plan generator. See apps/api/.env.example");
  }
  return fallbackPlan(profile);
}
