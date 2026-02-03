import { CompanyUser } from '../models/CompanyUser.model.js';
import AsyncHandler from '../utils/AsyncHandler.util.js';
import ApiError from '../utils/ApiError.util.js';
import ApiResponse from '../utils/ApiResponse.util.js';
import HTTP_STATUS from '../constants/httpStatusCodes.constant.js';
import { sendEmailApi } from '../utils/emailService.util.js';
import crypto from 'crypto';
/**
 * Generate Access and Refresh Tokens
 */
export const generateTokens = async (user) => {
  if (!user) {
    throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'User is required for token generation');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refresh_token = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

/**
 * Login Controller
 */
export const login = AsyncHandler(async (req, res) => {
  const { email, password, OTP } = req.body;

  // ❌ Invalid request if nothing usable is provided
  if (!OTP && (!email || !password)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Provide either OTP or email and password');
  }

  let user;

  /**
   * ============================
   * OTP-ONLY LOGIN FLOW
   * ============================
   */
  if (OTP) {
    user = await CompanyUser.findOne({
      forgot_password_otp: OTP,
      forgot_password_otp_expiry: { $gt: new Date() },
    });

    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired OTP');
    }

    // ✅ Clear OTP immediately (single-use)
    user.forgot_password_otp = null;
    user.forgot_password_otp_expiry = null;
    await user.save();
  } else {

  /**
   * ============================
   * EMAIL + PASSWORD LOGIN FLOW
   * ============================
   */
    user = await CompanyUser.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }
  }

  /**
   * ============================
   * GENERATE TOKENS
   * ============================
   */
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token
  user.refresh_token = refreshToken;
  await user.save();

  /**
   * ============================
   * COOKIE OPTIONS (DEV SAFE)
   * ============================
   */
  const cookieOptions = {
    httpOnly: true,
    secure: false, // true in production with HTTPS
    sameSite: 'lax',
  };

  res
    .cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: Number(process.env.ACCESS_COOKIE_MAX_AGE),
    })
    .cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: Number(process.env.REFRESH_COOKIE_MAX_AGE),
    });

  /**
   * ============================
   * RESPONSE (ALL USER + COMPANY INFO)
   * ============================
   */
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        company_id: user.company_id,
        is_online: user.is_online,
      },
      'Login successful'
    )
  );
});

export const logout = AsyncHandler(async (req, res) => {
  const user = req.user; // set by auth middleware

  if (!user || !user.company_id) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
  }

  /**
   * ============================
   * REMOVE REFRESH TOKEN FROM DB
   * ============================
   */
  await CompanyUser.findOneAndUpdate(
    {
      _id: user._id,
      company_id: user.company_id,
    },
    {
      $set: { refresh_token: null },
    },
    {
      runValidators: false, // ✅ DO NOT validate before update
    }
  );

  /**
   * ============================
   * CLEAR AUTH COOKIES
   * ============================
   */
  const cookieOptions = {
    httpOnly: true,
    secure: false, // true in production
    sameSite: 'lax',
  };

  res.clearCookie('accessToken', cookieOptions).clearCookie('refreshToken', cookieOptions);

  /**
   * ============================
   * RESPONSE
   * ============================
   */
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, 'Logout successful'));
});

// OTP Login
export const forgetPassword = AsyncHandler(async (req, res) => {
  const { recoveryEmail } = req.body;

  if (!recoveryEmail) {
    throw new ApiError(400, 'Email is required');
  }

  const user = await CompanyUser.findOne({ email: recoveryEmail });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.forgot_password_otp = otp;
  user.forgot_password_otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await user.save();

  // Send OTP email
  await sendEmailApi({
    from: `"Crisp Support" <${process.env.EMAIL_USER}>`,
    to: recoveryEmail,
    subject: 'Password Reset OTP',
    html: `
      <p>Hello ${user.username},</p>
      <p>Your password reset OTP is:</p>
      <h2>${otp}</h2>
      <p>This OTP is valid for 10 minutes.</p>
    `,
  });

  return res.json(new ApiResponse(200, null, 'OTP sent to your email'));
});

/**
 * Verify OTP for password reset
 */
export const verifyOtp = AsyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Email and OTP are required');
  }

  const user = await CompanyUser.findOne({
    email: email.toLowerCase(),
    forgot_password_otp: otp,
    forgot_password_otp_expiry: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired OTP');
  }

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, null, 'OTP verified successfully')
  );
});

/**
 * Reset password using OTP
 * Note: OTP is optional if user is already verified via verify-otp
 */
export const resetPassword = AsyncHandler(async (req, res) => {
  const { email, newPassword, otp } = req.body;

  if (!email || !newPassword) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Email and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Password must be at least 6 characters');
  }

  // Find user by email and verify OTP if provided
  const query = { email: email.toLowerCase() };
  if (otp) {
    query.forgot_password_otp = otp;
    query.forgot_password_otp_expiry = { $gt: new Date() };
  } else {
    // If no OTP provided, check if user has a valid OTP (already verified)
    query.forgot_password_otp = { $ne: null };
    query.forgot_password_otp_expiry = { $gt: new Date() };
  }

  const user = await CompanyUser.findOne(query);

  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired OTP');
  }

  // Update password
  user.password_hash = newPassword; // Will be hashed by pre-save hook
  user.forgot_password_otp = null;
  user.forgot_password_otp_expiry = null;
  await user.save();

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, null, 'Password reset successfully')
  );
});

