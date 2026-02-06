import ApiError from "../utils/ApiError.util.js";
import AsyncHandler from "../utils/AsyncHandler.util.js";
import HTTP_STATUS from "../constants/httpStatusCodes.constant.js";

/**
 * ======================================================
 * ✅ ROLE BASED AUTHORIZATION MIDDLEWARE
 *
 * Usage:
 * authorize("company_admin")
 * authorize("company_admin", "super_admin")
 * ======================================================
 */
export const authorize = (...allowedRoles) => {
  return AsyncHandler(async (req, res, next) => {
    /**
     * ✅ User must be authenticated first
     */
    if (!req.user) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "Not authenticated. Please login first."
      );
    }

    /**
     * ✅ Role must exist
     */
    if (!req.user.role) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Access denied. Role not assigned."
      );
    }

    /**
     * ✅ Check Role Permission
     */
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        `Access denied. Only [${allowedRoles.join(
          ", "
        )}] can perform this action.`
      );
    }

    /**
     * ✅ Allowed → Continue
     */
    next();
  });
};
