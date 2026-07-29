import { Router } from "express";
import { indicadoresQuerySchema } from "../schemas/queryParams.js";
import { getIndicadores } from "../services/indicadoresService.js";

export const indicadoresRouter = Router();

indicadoresRouter.get("/", async (req, res, next) => {
  try {
    const query = indicadoresQuerySchema.parse(req.query);
    const data = await getIndicadores(query);
    res.json(data);
  } catch (error) {
    next(error);
  }
});
