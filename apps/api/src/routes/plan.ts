import { Router } from "express";
import { db } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth.js";
import { generatePlan } from "../llm.js";
import type { ProfileData } from "../types.js";

interface ProfileRow {
  height_cm: number;
  weight_kg: number;
  target_weight_kg: number;
  age: number;
  gender: string;
  activity_level: string;
  goal: string;
  preferred_program: string;
}

interface PlanRow {
  id: number;
  summary: string;
  program_type: string;
  weekly_schedule: string;
  nutrition_tips: string;
  created_at: string;
}

function serializePlan(row: PlanRow) {
  return {
    id: row.id,
    summary: row.summary,
    programType: row.program_type,
    weeklySchedule: JSON.parse(row.weekly_schedule),
    nutritionTips: JSON.parse(row.nutrition_tips),
    createdAt: row.created_at,
  };
}

const router = Router();

router.get("/", requireAuth, (req: AuthedRequest, res) => {
  const row = db
    .prepare("SELECT * FROM plans WHERE user_id = ? ORDER BY id DESC LIMIT 1")
    .get(req.userId!) as PlanRow | undefined;
  res.json({ plan: row ? serializePlan(row) : null });
});

router.post("/generate", requireAuth, async (req: AuthedRequest, res) => {
  const profileRow = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(req.userId!) as
    | ProfileRow
    | undefined;

  if (!profileRow) {
    res.status(400).json({ error: "Save your medical/fitness profile before generating a plan" });
    return;
  }

  const profile: ProfileData = {
    heightCm: profileRow.height_cm,
    weightKg: profileRow.weight_kg,
    targetWeightKg: profileRow.target_weight_kg,
    age: profileRow.age,
    gender: profileRow.gender,
    activityLevel: profileRow.activity_level,
    goal: profileRow.goal,
    preferredProgram: profileRow.preferred_program,
  };

  try {
    const generated = await generatePlan(profile);
    const result = db
      .prepare(
        `INSERT INTO plans (user_id, summary, program_type, weekly_schedule, nutrition_tips)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        req.userId!,
        generated.summary,
        generated.programType,
        JSON.stringify(generated.weeklySchedule),
        JSON.stringify(generated.nutritionTips)
      );

    const row = db.prepare("SELECT * FROM plans WHERE id = ?").get(result.lastInsertRowid) as PlanRow;
    res.json({ plan: serializePlan(row) });
  } catch (err) {
    console.error("[plan/generate] failed:", err);
    res.status(502).json({ error: "Could not generate a plan right now. Please try again." });
  }
});

export default router;
