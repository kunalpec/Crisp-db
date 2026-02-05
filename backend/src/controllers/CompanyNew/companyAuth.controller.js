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
 * ✅ TOKEN GENERATOR
 * ======================================================
 */
export const generateTokens = async (user) => {
  if (!user) {
    throw new ApiError(500, "User required for token generation");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refresh_token = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

/**
 * ======================================================
 * ✅ COMPANY REGISTER + OWNER ADMIN CREATE
 * Route: POST /api/company/auth/register
 * ======================================================
 */
export const registerCompany = AsyncHandler(async (req, res) => {
  const {
    company_name,
    company_domain,
    username,
    email,
    password,
    phone_number,
  } = req.body;

  if (!company_name || !company_domain || !username || !email || !password) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // ✅ Phone validation
  if (
    !phone_number ||
    !phone_number.country_code ||
    !phone_number.number
  ) {
    throw new ApiError(400, "Phone number is required");
  }

  // ✅ Check company exists
  const existingCompany = await Company.findOne({
    domain: company_domain.toLowerCase(),
  });

  if (existingCompany) {
    throw new ApiError(400, "Company already exists with this domain");
  }

  // ✅ Check email already exists globally
  const existingUser = await CompanyUser.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw new ApiError(400, "User already exists with this email");
  }

  // ✅ Get default plan
  const defaultPlan = await Plan.findOne({
    is_default: true,
    is_active: true,
  });

  if (!defaultPlan) {
    throw new ApiError(500, "Default plan not found");
  }

  // ✅ Create company
  const company = await Company.create({
    name: company_name.trim(),
    domain: company_domain.toLowerCase().trim(),
    plan_id: defaultPlan._id,
    subscription_status: "trial",
  });

  // ✅ Create owner admin user (password auto-hash in schema)
  const adminUser = await CompanyUser.create({
    company_id: company._id,
    username: username.trim(),
    email: email.toLowerCase(),
    password: password,
    phone_number,
    role: "company_admin",
  });

  // ✅ Assign owner
  company.owner_user_id = adminUser._id;
  await company.save();

  return res.status(201).json(
    new ApiResponse(
      201,
      { company, adminUser },
      "Company registered successfully"
    )
  );
});

/**
 * ======================================================
 * ✅ EMPLOYEE SIGNUP (AGENT)
 * Route: POST /api/company/auth/employee-signup
 * ======================================================
 */
export const employeeSignup = AsyncHandler(async (req, res) => {
  const { company_domain, username, email, password, phone_number } = req.body;

  if (!company_domain || !username || !email || !password) {
    throw new ApiError(400, "All fields required");
  }

  // ✅ Find company
  const company = await Company.findOne({
    domain: company_domain.toLowerCase(),
  });

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  // ✅ Check duplicate user inside company
  const existingUser = await CompanyUser.findOne({
    company_id: company._id,
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw new ApiError(400, "User already exists in this company");
  }

  // ✅ Create employee agent
  const employee = await CompanyUser.create({
    company_id: company._id,
    username: username.trim(),
    email: email.toLowerCase(),
    password: password,
    phone_number,
    role: "company_agent",
  });

  return res.status(201).json(
    new ApiResponse(201, employee, "Employee registered successfully")
  );
});

/**
 * ======================================================
 * ✅ LOGIN (ADMIN + AGENT BOTH)
 * Route: POST /api/company/auth/login
 * ======================================================
 */
export const login = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password required");
  }

  // ✅ Find user (include password field)
  const user = await CompanyUser.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  // ✅ Check password
  const valid = await user.isPasswordCorrect(password);

  if (!valid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // ✅ Generate Tokens
  const { accessToken, refreshToken } = await generateTokens(user);

  // ✅ Secure Cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
      },
      "Login successful"
    )
  );
});

/**
 * ======================================================
 * ✅ LOGOUT
 * Route: POST /api/company/auth/logout
 * ======================================================
 */
export const logout = AsyncHandler(async (req, res) => {
  const user = req.user;

  await CompanyUser.findByIdAndUpdate(user._id, {
    refresh_token: null,
  });

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.json(new ApiResponse(200, null, "Logout successful"));
});

/**
 * ======================================================
 * ✅ FORGOT PASSWORD OTP SEND
 * Route: POST /api/company/auth/forgot-password
 * ======================================================
 */
export const forgetPassword = AsyncHandler(async (req, res) => {
  const { recoveryEmail } = req.body;

  if (!recoveryEmail) throw new ApiError(400, "Email required");

  const user = await CompanyUser.findOne({
    email: recoveryEmail.toLowerCase(),
  });

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

  if (!email || !otp || !newPassword) {
    throw new ApiError(400, "All fields required");
  }

  const user = await CompanyUser.findOne({
    email: email.toLowerCase(),
    forgot_password_otp: otp,
    forgot_password_otp_expiry: { $gt: new Date() },
  });

  if (!user) throw new ApiError(401, "Invalid OTP");

  // ✅ Correct field
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
export const refresh_accessToken = AsyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) throw new ApiError(401, "Refresh token missing");

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await CompanyUser.findById(decoded._id);

  if (!user || user.refresh_token !== refreshToken) {
    throw new ApiError(401, "Token revoked");
  }

  const { accessToken, refreshToken: newRefresh } =
    await generateTokens(user);

  res.cookie("accessToken", accessToken);
  res.cookie("refreshToken", newRefresh);

  return res.json(
    new ApiResponse(200, { accessToken }, "Token refreshed")
  );
});
