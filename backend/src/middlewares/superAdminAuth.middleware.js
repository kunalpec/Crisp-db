import jwt from "jsonwebtoken";
import { SuperAdmin } from "../models/SuperAdmin.model.js";
import ApiError from "../utils/ApiError.util.js";
import AsyncHandler from "../utils/AsyncHandler.util.js";

export const verifySuperAdminJWT = AsyncHandler(async (req, res, next) => {
  let token;

  /**
   * ✅ Token from Header OR Cookies
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
   * ❌ Token Missing
   */
  if (!token) {
    throw new ApiError(401, "SuperAdmin access token missing");
  }

  /**
   * ✅ Verify Token
   */
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired SuperAdmin token");
  }

  /**
   * ✅ Find SuperAdmin in DB
   */
  const admin = await SuperAdmin.findById(decoded._id).select(
    "-password -refresh_token"
  );

  if (!admin) {
    throw new ApiError(401, "SuperAdmin not found");
  }

  /**
   * ✅ Extra Security: Role Check
   */
  if (admin.role !== "superadmin") {
    throw new ApiError(403, "Access denied: Not a SuperAdmin");
  }

  /**
   * ✅ Attach SuperAdmin to Request
   */
  req.user = admin;

  next();
});
