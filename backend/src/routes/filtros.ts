import { Router } from "express";
import { getFiltros } from "../services/filtrosService.js";

export const filtrosRouter = Router();

filtrosRouter.get("/", async (_req, res, next) => {
  try {
    const data = await getFiltros();
    res.json(data);
  } catch (error) {
    next(error);
  }
});
