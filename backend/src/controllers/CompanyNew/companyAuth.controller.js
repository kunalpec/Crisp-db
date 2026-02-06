import { Company } from "../../models/Company.model.js";
import { CompanyUser } from "../../models/CompanyUser.model.js";
import { Plan } from "../../models/Plan.model.js";

import AsyncHandler from "../../utils/AsyncHandler.util.js";
import ApiError from "../../utils/ApiError.util.js";
import ApiResponse from "../../utils/ApiResponse.util.js";
import HTTP_STATUS from "../../constants/httpStatusCodes.constant.js";

import { sendEmailApi } from "../../utils/emailService.util.js";
import jwt from "jsonwebtoken";

/**
 * ======================================================
 * ✅ GENERATE ACCESS & REFRESH TOKENS
 * ======================================================
 */
export const generateTokens = async (user) => {
  if (!user) throw new ApiError(500, "User required for token generation");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refresh_token = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

/**
 * ======================================================
 * ✅ REGISTER COMPANY + ADMIN
 * Route: POST /api/company/auth/register
 * ======================================================
 */
export const registerCompany = AsyncHandler(async (req, res) => {
  const { company_name, company_domain, username, email, password, phone_number } = req.body;

  if (!company_name || !company_domain || !username || !email || !password || !phone_number?.number || !phone_number?.country_code) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // Check if company exists
  const existingCompany = await Company.findOne({ domain: company_domain.toLowerCase() });
  if (existingCompany) throw new ApiError(400, "Company already exists with this domain");

  // Check if email exists globally
  const existingUser = await CompanyUser.findOne({ email: email.toLowerCase() });
  if (existingUser) throw new ApiError(400, "User already exists with this email");

  // Get default plan
  const defaultPlan = await Plan.findOne({ is_default: true, is_active: true });
  if (!defaultPlan) throw new ApiError(500, "Default plan not found");

  // Create company
  const company = await Company.create({
    name: company_name.trim(),
    domain: company_domain.toLowerCase().trim(),
    plan_id: defaultPlan._id,
    subscription_status: "trial",
  });

  // Create owner admin user (password auto-hashed in schema)
  const adminUser = await CompanyUser.create({
    company_id: company._id,
    username: username.trim(),
    email: email.toLowerCase(),
    password,
    phone_number,
    role: "company_admin",
  });

  // Assign owner
  company.owner_user_id = adminUser._id;
  await company.save();

  return res.status(201).json(new ApiResponse(201, { company, adminUser }, "Company registered successfully"));
});

/**
 * ======================================================
 * ✅ LOGIN (ADMIN + AGENT)
 * Route: POST /api/company/auth/login
 * ======================================================
 */
export const login = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password required");

  const user = await CompanyUser.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) throw new ApiError(401, "Invalid credentials");

  const valid = await user.isPasswordCorrect(password);
  if (!valid) throw new ApiError(401, "Invalid credentials");

  const { accessToken, refreshToken } = await generateTokens(user);

  // Set secure cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

  return res.status(200).json(new ApiResponse(200, {
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
    },
    accessToken,
  }, "Login successful"));
});

/**
 * ======================================================
 * ✅ LOGOUT
 * Route: POST /api/company/auth/logout
 * ======================================================
 */
export const logout = AsyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(401, "Not authenticated");

  await CompanyUser.findByIdAndUpdate(user._id, { refresh_token: null });

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.json(new ApiResponse(200, null, "Logout successful"));
});

/**
 * ======================================================
 * ✅ FORGOT PASSWORD OTP
 * Route: POST /api/company/auth/forgot-password
 * ======================================================
 */
export const forgetPassword = AsyncHandler(async (req, res) => {
  const { recoveryEmail } = req.body;
  if (!recoveryEmail) throw new ApiError(400, "Email required");

  const user = await CompanyUser.findOne({ email: recoveryEmail.toLowerCase() });
  if (!user) throw new ApiError(404, "User not found");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.forgot_password_otp = otp;
  user.forgot_password_otp_expiry = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  await sendEmailApi({
    to: recoveryEmail,
    subject: "Password Reset OTP",
    html: `<h2>Your OTP is ${otp}</h2><p>Valid for 10 minutes.</p>`,
  });

  return res.json(new ApiResponse(200, null, "OTP sent successfully"));
});

/**
 * ======================================================
 * ✅ RESET PASSWORD
 * Route: POST /api/company/auth/reset-password
 * ======================================================
 */
export const resetPassword = AsyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) throw new ApiError(400, "All fields required");

  const user = await CompanyUser.findOne({
    email: email.toLowerCase(),
    forgot_password_otp: otp,
    forgot_password_otp_expiry: { $gt: new Date() },
  });

  if (!user) throw new ApiError(401, "Invalid OTP");

  user.password = newPassword;
  user.forgot_password_otp = null;
  user.forgot_password_otp_expiry = null;

  await user.save();

  return res.json(new ApiResponse(200, null, "Password reset successful"));
});

/**
 * ======================================================
 * ✅ REFRESH TOKEN
 * Route: GET /api/company/auth/refresh
 * ======================================================
 */
export const refreshAccessToken = AsyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) throw new ApiError(401, "Refresh token missing");

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await CompanyUser.findById(decoded._id);
  if (!user || user.refresh_token !== refreshToken) throw new ApiError(401, "Token revoked");

  const { accessToken, refreshToken: newRefresh } = await generateTokens(user);

  res.cookie("accessToken", accessToken);
  res.cookie("refreshToken", newRefresh);

  return res.json(new ApiResponse(200, { accessToken }, "Token refreshed"));
});
