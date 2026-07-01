import { Router } from "express";
import { gyms } from "../data/gyms.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ gyms });
});

export default router;
