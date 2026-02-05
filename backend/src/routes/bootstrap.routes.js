import express from "express";

// Bootstrap controllers
import {
  createSuperCompany,
  createSuperAdmin,
  getBootstrapStatus,
} from "../controllers/BootStarpNew/bootstrap.controller.js";

const router = express.Router();

// ============================
// Bootstrap Routes
// ============================

// Create initial super company
router.post("/company", createSuperCompany);

// Create initial super admin
router.post("/superadmin", createSuperAdmin);

// Get bootstrap status
router.get("/status", getBootstrapStatus);

export default router;
