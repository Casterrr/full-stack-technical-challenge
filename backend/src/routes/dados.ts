import { Router } from "express";
import { dadosQuerySchema } from "../schemas/queryParams.js";
import { getDados } from "../services/dadosService.js";

export const dadosRouter = Router();

dadosRouter.get("/", async (req, res, next) => {
  try {
    const query = dadosQuerySchema.parse(req.query);
    const data = await getDados(query);
    res.json(data);
  } catch (error) {
    next(error);
  }
});
