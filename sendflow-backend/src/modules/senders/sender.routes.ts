
import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware";

import {
  addSender,
  listSenders,
  removeSender,
} from "./sender.controller";

const router = Router();

// All sender routes require JWT authentication
router.use(authenticate);

// Add SMTP sender
router.post("/", addSender);

// Get all senders
router.get("/", listSenders);

// Delete sender
router.delete("/:id", removeSender);

export default router;
