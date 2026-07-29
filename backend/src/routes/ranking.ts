import { Router } from "express";
import { rankingQuerySchema } from "../schemas/queryParams.js";
import { getRanking } from "../services/rankingService.js";

export const rankingRouter = Router();

rankingRouter.get("/", async (req, res, next) => {
  try {
    const query = rankingQuerySchema.parse(req.query);
    const data = await getRanking(query);
    res.json(data);
  } catch (error) {
    next(error);
  }
});
