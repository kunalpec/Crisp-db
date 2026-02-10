import express from "express";

/* ================= AUTH CONTROLLERS ================= */
import {
  registerCompany,
  login,
  logout,
  forgetPassword,
  resetPassword,
  refreshAccessToken, 
  verifyOtp,
} from "../controllers/CompanyNew/companyAuth.controller.js";

/* ================= DASHBOARD CONTROLLERS ================= */
import {
  getCompanyDashboard,
  getCompanyPlan as getDashboardPlan, // renamed to avoid conflict
  updateCompanyStatus,
} from "../controllers/CompanyNew/companyDashboard.controller.js";

/* ================= PLAN CONTROLLERS ================= */
import {
  getAllPlans,
  getCompanyPlan as getCurrentCompanyPlan, // renamed
  updateCompanyPlan,
  getDefaultPlan,
} from "../controllers/CompanyNew/companyPlan.controller.js";

/* ================= COMPANY USER CONTROLLERS ================= */
import {
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  loginEmployee,
} from "../controllers/CompanyNew/companyUser.controller.js";


import {
  inviteEmployee,
  acceptInvite,
} from "../controllers/InviteNew/invite.controller.js";

import { authenticate } from "../middlewares/Auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js"; // optional role-based middleware

const router = express.Router();

/* =====================================================
   AUTH ROUTES
===================================================== */
router.post("/auth/register", registerCompany);
router.post("/auth/login", login);
router.post("/auth/logout", authenticate, logout);
router.post("/auth/forgot-password", forgetPassword);
router.post("/auth/verify-otp", verifyOtp);
router.post("/auth/reset-password", resetPassword);
router.get("/auth/refresh", refreshAccessToken );

/* =====================================================
   DASHBOARD ROUTES
===================================================== */
router.get("/dashboard", authenticate, getCompanyDashboard);
router.get("/dashboard/plan", authenticate, getDashboardPlan);
router.patch("/dashboard/status/:companyId", authenticate, updateCompanyStatus);

/* =====================================================
   PLAN ROUTES
===================================================== */
router.get("/plans", authenticate, getAllPlans);
router.get("/plans/current", authenticate, getCurrentCompanyPlan);
router.get("/plans/default", authenticate, getDefaultPlan);
router.patch("/plans/update", authenticate, updateCompanyPlan);

/* =====================================================
   COMPANY USER ROUTES
   - Admin can manage employees
   - Employee login
===================================================== */
router.get("/users", authenticate, getEmployees); // list employees
router.get("/users/:id", authenticate, getEmployee); // get single employee
router.patch("/users/:id", authenticate, authorize("company_admin"), updateEmployee); // admin update
router.delete("/users/:id", authenticate, authorize("company_admin"), deleteEmployee); // admin delete
router.post("/users/login", loginEmployee); // employee login


/* Admin Invite */
router.post("/invite", authenticate, inviteEmployee);

/* Accept Invite */
router.post("/invite/accept", acceptInvite);

export default router;
