import { CompanyUser } from '../models/CompanyUser.model.js';
import AsyncHandler from '../utils/AsyncHandler.util.js';
import ApiError from '../utils/ApiError.util.js';
import ApiResponse from '../utils/ApiResponse.util.js';
import HTTP_STATUS from '../constants/httpStatusCodes.constant.js';
import { sendEmailApi } from '../utils/emailService.util.js';
import jwt from 'jsonwebtoken';

/**
 * ============================
 * Generate Tokens
 * ============================
 */
export const generateTokens = async (user) => {
  if (!user) {
    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'User required for token generation'
    );
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refresh_token = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

/**
 * ============================
 * LOGIN
 * ============================
 */
export const login = AsyncHandler(async (req, res) => {
  const { email, password, OTP } = req.body;

  if (!OTP && (!email || !password)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Provide OTP OR email + password'
    );
  }

  let user;

  /**
   * OTP LOGIN
   */
  if (OTP) {
    if (!email) {
      throw new ApiError(400, 'Email required with OTP');
    }

    user = await CompanyUser.findOne({
      email: email.toLowerCase(),
      forgot_password_otp: OTP,
      forgot_password_otp_expiry: { $gt: new Date() },
    });

    if (!user) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'Invalid or expired OTP'
      );
    }

    // Clear OTP after use
    user.forgot_password_otp = null;
    user.forgot_password_otp_expiry = null;
    await user.save();
  }

  /**
   * EMAIL + PASSWORD LOGIN
   */
  else {
    user = await CompanyUser.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'Invalid email or password'
      );
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'Invalid email or password'
      );
    }
  }

  /**
   * Generate tokens
   */
  const { accessToken, refreshToken } = await generateTokens(user);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res
    .cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: Number(process.env.ACCESS_COOKIE_MAX_AGE),
      path: '/',
    })
    .cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: Number(process.env.REFRESH_COOKIE_MAX_AGE),
      path: '/',
    });

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

/**
 * ============================
 * LOGOUT
 * ============================
 */
export const logout = AsyncHandler(async (req, res) => {
  const user = req.user;

  if (!user || !user.company_id) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      'User not authenticated'
    );
  }

  await CompanyUser.findOneAndUpdate(
    {
      _id: user._id,
      company_id: user.company_id,
    },
    {
      $set: { refresh_token: null },
    },
    { runValidators: false }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };

  res
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions);

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, 'Logout successful'));
});

/**
 * ============================
 * FORGOT PASSWORD (OTP SEND)
 * ============================
 */
export const forgetPassword = AsyncHandler(async (req, res) => {
  const { recoveryEmail } = req.body;

  if (!recoveryEmail) {
    throw new ApiError(400, 'Email required');
  }

  const user = await CompanyUser.findOne({
    email: recoveryEmail.toLowerCase(),
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.forgot_password_otp = otp;
  user.forgot_password_otp_expiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendEmailApi({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to: recoveryEmail,
    subject: 'Password Reset OTP',
    html: `
      <p>Hello ${user.username},</p>
      <p>Your OTP is:</p>
      <h2>${otp}</h2>
      <p>Valid for 10 minutes.</p>
    `,
  });

  return res.json(
    new ApiResponse(200, null, 'OTP sent to email')
  );
});

/**
 * ============================
 * VERIFY OTP
 * ============================
 */
export const verifyOtp = AsyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Email and OTP required'
    );
  }

  const user = await CompanyUser.findOne({
    email: email.toLowerCase(),
    forgot_password_otp: otp,
    forgot_password_otp_expiry: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      'Invalid or expired OTP'
    );
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(200, null, 'OTP verified'));
});

/**
 * ============================
 * RESET PASSWORD
 * ============================
 */
export const resetPassword = AsyncHandler(async (req, res) => {
  const { email, newPassword, otp } = req.body;

  if (!email || !newPassword || !otp) {
    throw new ApiError(400, 'Email, OTP and password required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'Password min 6 chars');
  }

  const user = await CompanyUser.findOne({
    email: email.toLowerCase(),
    forgot_password_otp: otp,
    forgot_password_otp_expiry: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid or expired OTP');
  }

  user.password_hash = newPassword;
  user.forgot_password_otp = null;
  user.forgot_password_otp_expiry = null;
  await user.save();

  return res.json(
    new ApiResponse(200, null, 'Password reset successful')
  );
});

/**
 * ============================
 * REFRESH TOKEN
 * ============================
 */
export const refresh_accessToken = AsyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token missing');
  }

  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const user = await CompanyUser.findOne({
    _id: decoded._id,
    company_id: decoded.company_id,
  });

  if (!user || user.refresh_token !== refreshToken) {
    throw new ApiError(401, 'Token revoked');
  }

  const { accessToken, refreshToken: newRefresh } =
    await generateTokens(user);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };

  res
    .cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: Number(process.env.ACCESS_COOKIE_MAX_AGE),
    })
    .cookie('refreshToken', newRefresh, {
      ...cookieOptions,
      maxAge: Number(process.env.REFRESH_COOKIE_MAX_AGE),
    });

  return res.json(
    new ApiResponse(200, { accessToken }, 'Token refreshed')
  );
});
