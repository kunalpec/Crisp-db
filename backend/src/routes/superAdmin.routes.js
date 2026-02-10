import express from "express";

/* ===============================
   SUPER ADMIN AUTH CONTROLLERS
=============================== */

import {
  loginSuperAdmin,
  logoutSuperAdmin,
  forgotPasswordSuperAdmin,
  resetPasswordSuperAdmin,
  refreshTokenSuperAdmin,
} from "../controllers/SuperAdminNew/superAdminAuth.controller.js";

/* ===============================
   SUPER ADMIN COMPANY CONTROLLERS
=============================== */

import {
  getAllActiveCompanies,
  getCompanyById,
  updateCompanyStatus,
  deleteCompany,
} from "../controllers/SuperAdminNew/superAdminCompany.controller.js";

/* ===============================
   SUPER ADMIN PLAN CONTROLLERS
=============================== */

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

/* ===============================
   MIDDLEWARE
=============================== */

import { verifySuperAdminJWT } from "../middlewares/superAdminAuth.middleware.js";

const router = express.Router();

/* =====================================================
   AUTH ROUTES
===================================================== */

// Login
router.post("/auth-superadmin/login", loginSuperAdmin);

// Logout (Protected)
router.post("/auth-superadmin/logout", verifySuperAdminJWT, logoutSuperAdmin);

// Forgot password
router.post("/auth-superadmin/forgot-password", forgotPasswordSuperAdmin);

// Reset password
router.post("/auth-superadmin/reset-password", resetPasswordSuperAdmin);

// Refresh token
router.get("/auth-superadmin/refresh", refreshTokenSuperAdmin);


/* =====================================================
   COMPANY MANAGEMENT ROUTES
===================================================== */

// Get all active companies (Protected)
router.get("/companies", verifySuperAdminJWT, getAllActiveCompanies);

// Get company by ID (Protected)
router.get("/companies/:companyId", verifySuperAdminJWT, getCompanyById);

// Update company status (Protected)
router.patch(
  "/companies/:companyId/status",
  verifySuperAdminJWT,
  updateCompanyStatus
);

// Delete company (Protected)
router.delete(
  "/companies/:companyId",
  verifySuperAdminJWT,
  deleteCompany
);


/* =====================================================
   PLAN MANAGEMENT ROUTES
===================================================== */

// Create new plan (Protected)
router.post("/plans", verifySuperAdminJWT, createPlan);

// Update plan (Protected)
router.patch("/plans/:planId", verifySuperAdminJWT, updatePlan);

// Deactivate plan (Protected)
router.patch(
  "/plans/:planId/deactivate",
  verifySuperAdminJWT,
  deactivatePlan
);

// Activate plan (Protected)
router.patch(
  "/plans/:planId/activate",
  verifySuperAdminJWT,
  activatePlan
);

// Delete plan (Protected)
router.delete("/plans/:planId", verifySuperAdminJWT, deletePlan);

// Get active plans (Public)
router.get("/plans/active", getActivePlans);

// Get plan by ID (Public)
router.get("/plans/:planId", getPlanById);

// Get all plans (Protected)
router.get("/plans", verifySuperAdminJWT, getAllPlans);

export default router;
