import express from "express";

// Super Admin auth controllers
import {
  loginSuperAdmin,
  logoutSuperAdmin,
  forgotPasswordSuperAdmin,
  resetPasswordSuperAdmin,
  refreshTokenSuperAdmin,
} from "../controllers/SuperAdminNew/superAdminAuth.controller.js";

// Super Admin company controllers
import {
  getAllActiveCompanies,
  getCompanyById,
  updateCompanyStatus,
  deleteCompany,
} from "../controllers/SuperAdminNew/superAdminCompany.controller.js";


import {
  createPlan,
  updatePlan,
  deactivatePlan,
  activatePlan,
  deletePlan,
  getActivePlans,
  getPlanById,
  getAllPlans,
} from "../controllers/SuperAdminNew/superAdminPlan.controller.js";

// Super Admin auth middleware
import { verifySuperAdminJWT } from "../middlewares/superAdminAuth.middleware.js";

const router = express.Router();

// ============================
// Super Admin Auth Routes
// ============================

// Login super admin
router.post("/login", loginSuperAdmin);

// Logout super admin (protected)
router.post("/logout", verifySuperAdminJWT, logoutSuperAdmin);

// Send OTP for forgot password
router.post("/forgot-password", forgotPasswordSuperAdmin);

// Reset password using OTP
router.post("/reset-password", resetPasswordSuperAdmin);

// Refresh access token
router.get("/refresh", refreshTokenSuperAdmin);

// ============================
// Super Admin Company Routes
// ============================

// Get all active companies (protected)
router.get("/companies", verifySuperAdminJWT, getAllActiveCompanies);

// Get company by ID (protected)
router.get("/companies/:companyId", verifySuperAdminJWT, getCompanyById);

// Update company status (protected)
router.patch(
  "/companies/:companyId/status",
  verifySuperAdminJWT,
  updateCompanyStatus
);

// Delete company (protected)
router.delete(
  "/companies/:companyId",
  verifySuperAdminJWT,
  deleteCompany
);





/**
 * SUPER ADMIN PLAN ROUTES
 */
router.post("/create-plan", verifySuperAdminJWT, createPlan);

router.patch("/plan:planId", verifySuperAdminJWT, updatePlan);

router.patch("/plan:planId/deactivate", verifySuperAdminJWT, deactivatePlan);

router.patch("/plan:planId/activate", verifySuperAdminJWT, activatePlan);

router.delete("/plan:planId", verifySuperAdminJWT, deletePlan);

router.get("/plan-active", getActivePlans);

router.get("/plan:planId", getPlanById);

router.get("/getall-plans", verifySuperAdminJWT, getAllPlans);

export default router;
