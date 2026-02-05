import { SuperAdmin } from "../../models/SuperAdmin.model.js";
import AsyncHandler from "../../utils/AsyncHandler.util.js";
import ApiError from "../../utils/ApiError.util.js";
import ApiResponse from "../../utils/ApiResponse.util.js";
import HTTP_STATUS from "../../constants/httpStatusCodes.constant.js";
import { sendEmailApi } from "../../utils/emailService.util.js";
import jwt from "jsonwebtoken";

/**
 * ============================
 * Generate Tokens
 * ============================
 */
export const generateTokens = async (admin) => {
  if (!admin) {
    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "SuperAdmin required for token generation"
    );
  }

  const accessToken = admin.generateAccessToken();
  const refreshToken = admin.generateRefreshToken();

  admin.refresh_token = refreshToken;
  await admin.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

/**
 * ============================
 * LOGIN SUPER ADMIN
 * ============================
 */
export const loginSuperAdmin = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Email and password are required"
    );
  }

  // ✅ Find SuperAdmin
  const admin = await SuperAdmin.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!admin) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Invalid email or password"
    );
  }

  // ✅ Check Password
  const isPasswordValid = await admin.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Invalid email or password"
    );
  }

  // ✅ Generate Tokens
  const { accessToken, refreshToken } = await generateTokens(admin);

  // ✅ Cookie Options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  res
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: Number(process.env.ACCESS_COOKIE_MAX_AGE),
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: Number(process.env.REFRESH_COOKIE_MAX_AGE),
    });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        phone_number: admin.phone_number,
      },
      "SuperAdmin login successful"
    )
  );
});

/**
 * ============================
 * LOGOUT SUPER ADMIN
 * ============================
 */
export const logoutSuperAdmin = AsyncHandler(async (req, res) => {
  const admin = req.user;

  if (!admin) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "SuperAdmin not authenticated"
    );
  }

  await SuperAdmin.findByIdAndUpdate(admin._id, {
    $set: { refresh_token: null },
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions);

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Logout successful"));
});

/**
 * ============================
 * FORGOT PASSWORD (OTP SEND)
 * ============================
 */
export const forgotPasswordSuperAdmin = AsyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email required");
  }

  const admin = await SuperAdmin.findOne({
    email: email.toLowerCase(),
  });

  if (!admin) {
    throw new ApiError(404, "SuperAdmin not found");
  }

  // ✅ Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  admin.forgot_password_otp = otp;
  admin.forgot_password_otp_expiry = new Date(Date.now() + 10 * 60 * 1000);

  await admin.save();

  // ✅ Send Email
  await sendEmailApi({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "SuperAdmin Password Reset OTP",
    html: `
      <h2>Hello ${admin.username}</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>Valid for 10 minutes.</p>
    `,
  });

  return res.json(
    new ApiResponse(200, null, "OTP sent successfully")
  );
});

/**
 * ============================
 * RESET PASSWORD WITH OTP
 * ============================
 */
export const resetPasswordSuperAdmin = AsyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new ApiError(400, "Email, OTP and new password required");
  }

  const admin = await SuperAdmin.findOne({
    email: email.toLowerCase(),
    forgot_password_otp: otp,
    forgot_password_otp_expiry: { $gt: new Date() },
  }).select("+password");

  if (!admin) {
    throw new ApiError(401, "Invalid or expired OTP");
  }

  // ✅ Set New Password
  admin.password = newPassword;

  // Clear OTP
  admin.forgot_password_otp = null;
  admin.forgot_password_otp_expiry = null;

  await admin.save();

  return res.json(
    new ApiResponse(200, null, "Password reset successful")
  );
});

/**
 * ============================
 * REFRESH TOKEN SUPER ADMIN
 * ============================
 */
export const refreshTokenSuperAdmin = AsyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }

  const admin = await SuperAdmin.findById(decoded._id);

  if (!admin || admin.refresh_token !== refreshToken) {
    throw new ApiError(401, "Token revoked");
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await generateTokens(admin);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.json(
    new ApiResponse(200, { accessToken }, "Token refreshed")
  );
});
