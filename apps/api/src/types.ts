export interface ProfileData {
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  age: number;
  gender: string;
  activityLevel: string;
  goal: string;
  preferredProgram: string;
}

export interface PlanDay {
  day: string;
  focus: string;
  exercises: string[];
}

export interface GeneratedPlan {
  summary: string;
  programType: string;
  weeklySchedule: PlanDay[];
  nutritionTips: string[];
}
