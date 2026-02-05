import jwt from "jsonwebtoken";
import { CompanyUser } from "../models/CompanyUser.model.js";
import ApiError from "../utils/ApiError.util.js";
import AsyncHandler from "../utils/AsyncHandler.util.js";
import HTTP_STATUS from "../constants/httpStatusCodes.constant.js";

/**
 * ======================================================
 * ✅ AUTHENTICATE COMPANY USER
 * Protects routes for:
 * - company_admin
 * - agent
 * ======================================================
 */
export const authenticate = AsyncHandler(async (req, res, next) => {
  let token;

  /**
   * ✅ 1. Extract Token (Header OR Cookie)
   */
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  /**
   * ✅ 2. Token Missing
   */
  if (!token) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Access token missing. Please login first."
    );
  }

  /**
   * ✅ 3. Verify Token
   */
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Invalid or expired access token"
    );
  }

  /**
   * ✅ 4. Fetch User from DB
   */
  const user = await CompanyUser.findById(decoded._id).select(
    "-password_hash -refresh_token"
  );

  if (!user) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "User not found or account deleted"
    );
  }

  /**
   * ✅ 5. Optional Safety Checks
   */
  if (user.status === "blocked") {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "Your account is blocked. Contact admin."
    );
  }

  if (!user.company_id) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Company not linked with this user"
    );
  }

  /**
   * ✅ 6. Attach User to Request
   */
  req.user = user;

  /**
   * ✅ Continue
   */
  next();
});
