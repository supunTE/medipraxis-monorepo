import type { Request, Response, NextFunction } from "express";

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"];
  const expectedKey = process.env.AI_ENGINE_API_KEY;

  if (!expectedKey) {
    console.error("AI_ENGINE_API_KEY not configured");
    res.status(500).json({ error: "Server misconfigured" });
    return;
  }

  if (apiKey !== expectedKey) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}
