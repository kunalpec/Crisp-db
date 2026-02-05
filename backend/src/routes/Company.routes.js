import express from "express";

import {
  registerCompany,
  employeeSignup,
  login,
  logout,
  forgetPassword,
  resetPassword,
  refresh_accessToken,
} from "../controllers/CompanyNew/companyAuth.controller.js";

import { authenticate } from "../middlewares/Auth.middleware.js";

const router = express.Router();

router.post("/register", registerCompany);

router.post("/employee-signup", employeeSignup);

router.post("/login", login);

router.post("/logout", authenticate, logout);

router.post("/forgot-password", forgetPassword);

router.post("/reset-password", resetPassword);

router.get("/refresh", refresh_accessToken);




export default router;
