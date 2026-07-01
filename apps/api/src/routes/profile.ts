import { Router } from "express";
import { db } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth.js";

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

function toBmi(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

function serialize(row: ProfileRow) {
  return {
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    targetWeightKg: row.target_weight_kg,
    age: row.age,
    gender: row.gender,
    activityLevel: row.activity_level,
    goal: row.goal,
    preferredProgram: row.preferred_program,
    bmi: toBmi(row.height_cm, row.weight_kg),
  };
}

const router = Router();

router.get("/", requireAuth, (req: AuthedRequest, res) => {
  const row = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(req.userId!) as
    | ProfileRow
    | undefined;
  res.json({ profile: row ? serialize(row) : null });
});

router.put("/", requireAuth, (req: AuthedRequest, res) => {
  const { heightCm, weightKg, targetWeightKg, age, gender, activityLevel, goal, preferredProgram } =
    req.body ?? {};

  const values = { heightCm, weightKg, targetWeightKg, age, gender, activityLevel, goal, preferredProgram };
  const numericFields: (keyof typeof values)[] = ["heightCm", "weightKg", "targetWeightKg", "age"];
  for (const field of numericFields) {
    if (typeof values[field] !== "number" || Number.isNaN(values[field]) || (values[field] as number) <= 0) {
      res.status(400).json({ error: `${field} must be a positive number` });
      return;
    }
  }
  if (!gender || !activityLevel || !goal || !preferredProgram) {
    res.status(400).json({ error: "gender, activityLevel, goal, and preferredProgram are required" });
    return;
  }

  db.prepare(
    `INSERT INTO profiles (user_id, height_cm, weight_kg, target_weight_kg, age, gender, activity_level, goal, preferred_program, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET
       height_cm = excluded.height_cm,
       weight_kg = excluded.weight_kg,
       target_weight_kg = excluded.target_weight_kg,
       age = excluded.age,
       gender = excluded.gender,
       activity_level = excluded.activity_level,
       goal = excluded.goal,
       preferred_program = excluded.preferred_program,
       updated_at = datetime('now')`
  ).run(req.userId!, heightCm, weightKg, targetWeightKg, age, gender, activityLevel, goal, preferredProgram);

  const row = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(req.userId!) as ProfileRow;
  res.json({ profile: serialize(row) });
});

export default router;
