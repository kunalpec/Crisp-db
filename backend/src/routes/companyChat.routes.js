import express from "express";

import {
  getWaitingVisitors,
  getActiveChatRoom,
} from "../controllers/ChatNew/chatRoom.controller.js";

import {
  getChatMessages,
} from "../controllers/ChatNew/message.controller.js";

import { authenticate } from "../middlewares/Auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

/**
 * ======================================================
 * ✅ AUTH REQUIRED FOR ALL CHAT ROUTES
 * ======================================================
 */
router.use(authenticate);

/**
 * ======================================================
 * ✅ 1. GET WAITING VISITORS (EMPLOYEE DASHBOARD)
 * Route: GET /api/chat/waiting
 * Access: company_admin, company_agent
 * ======================================================
 */
router.get(
  "/waiting",
  authorize("company_admin", "company_agent"),
  getWaitingVisitors
);

/**
 * ======================================================
 * ✅ 2. GET ACTIVE CHAT ROOM DETAILS
 * Route: GET /api/chat/rooms/:room_id
 * Access: company_admin, company_agent
 * ======================================================
 */
router.get(
  "/rooms/:room_id",
  authorize("company_admin", "company_agent"),
  getActiveChatRoom
);

/**
 * ======================================================
 * ✅ 3. GET CHAT MESSAGES (CHAT HISTORY)
 * Route: GET /api/chat/rooms/:room_id/messages
 * Access: company_admin, company_agent
 * ======================================================
 */
router.get(
  "/rooms/:room_id/messages",
  authorize("company_admin", "company_agent"),
  getChatMessages
);

export default router;
