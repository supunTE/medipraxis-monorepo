import "dotenv/config";
import express from "express";
import { processAIQuery } from "./lib";
import { apiKeyAuth } from "./middleware/auth";

const app = express();
app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "ai-engine" });
});

// AI query endpoint
app.post("/api/ai/query", apiKeyAuth, async (req, res) => {
  try {
    const { query, history, userId } = req.body;
    const result = await processAIQuery({ query, history, userId });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("AI Engine error:", error);
    res.status(500).json({ success: false, error: "AI processing failed" });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI Engine running on port ${PORT}`);
});
