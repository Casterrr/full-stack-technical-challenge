import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import { dadosRouter } from "./routes/dados.js";
import { filtrosRouter } from "./routes/filtros.js";
import { indicadoresRouter } from "./routes/indicadores.js";
import { rankingRouter } from "./routes/ranking.js";
import { seriesRouter } from "./routes/series.js";
import { uploadRouter } from "./routes/upload.js";
import { setupSwagger } from "./swagger.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  setupSwagger(app);

  app.use("/api/upload", uploadRouter);
  app.use("/api/filtros", filtrosRouter);
  app.use("/api/indicadores", indicadoresRouter);
  app.use("/api/series", seriesRouter);
  app.use("/api/ranking", rankingRouter);
  app.use("/api/dados", dadosRouter);

  app.use(errorHandler);

  return app;
}
