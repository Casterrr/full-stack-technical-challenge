import { Router } from "express";
import multer from "multer";
import { AppError } from "../lib/errors.js";
import { importCsv } from "../services/importService.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const name = file.originalname.toLowerCase();
    if (!name.endsWith(".csv")) {
      cb(new AppError(400, "Apenas arquivos .csv são aceitos"));
      return;
    }
    cb(null, true);
  },
});

export const uploadRouter = Router();

uploadRouter.post("/", (req, res, next) => {
  upload.single("file")(req, res, (err: unknown) => {
    if (err) {
      next(err);
      return;
    }

    void (async () => {
      try {
        if (!req.file) {
          throw new AppError(
            400,
            "Arquivo não enviado. Use o campo multipart 'file'.",
          );
        }

        if (req.file.size === 0) {
          throw new AppError(400, "Arquivo vazio");
        }

        // Arquivo .txt renomeado para .csv costuma falhar no cabeçalho;
        // ainda assim tentamos parsear e devolvemos 400 específico.
        const result = await importCsv(req.file.buffer);

        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    })();
  });
});
