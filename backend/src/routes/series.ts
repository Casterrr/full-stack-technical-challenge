import { Router } from "express";
import { seriesQuerySchema } from "../schemas/queryParams.js";
import { getSeries } from "../services/seriesService.js";

export const seriesRouter = Router();

seriesRouter.get("/", async (req, res, next) => {
  try {
    const query = seriesQuerySchema.parse(req.query);
    const data = await getSeries(query);
    res.json(data);
  } catch (error) {
    next(error);
  }
});
