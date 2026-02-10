import express from "express";
import {
  getCompanyChatRooms,
  getRoomMessages,
} from "../controllers/ChatNew/chatRoom.controller.js";

import {
  sendMessageHTTP,
} from "../controllers/ChatNew/message.controller.js";

import { authenticate } from "../middlewares/Auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
const router = express.Router();

/**
 * ======================================================
 * All routes below require authentication
 * ======================================================
 */
router.use(authenticate);

/**
 * ======================================================
 * GET ALL ACTIVE CHAT ROOMS
 * GET /api/company/chatrooms
 * Access: company_admin, company_agent
 * ======================================================
 */
router.get(
  "/chatrooms",
  authorize("company_admin", "company_agent"),
  getCompanyChatRooms
);

/**
 * ======================================================
 * GET ROOM MESSAGES
 * GET /api/company/chatrooms/:roomId/messages
 * Access: company_admin, company_agent
 * ======================================================
 */
router.get(
  "/chatrooms/:roomId/messages",
  authorize("company_admin", "company_agent"),
  getRoomMessages
);

/**
 * ======================================================
 * SEND MESSAGE (HTTP fallback)
 * POST /api/company/chatrooms/:roomId/message
 * Access: company_admin, company_agent
 * ======================================================
 */
router.post(
  "/chatrooms/:roomId/message",
  authorize("company_admin", "company_agent"),
  sendMessageHTTP
);

export default router;
