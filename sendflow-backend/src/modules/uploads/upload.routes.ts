import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { upload } from "./upload.middleware";
import { uploadRecipients } from "./upload.controller";

const router = Router();

router.use(authenticate);

router.post(
  "/recipients",
  upload.single("file"),
  uploadRecipients
);

export default router;