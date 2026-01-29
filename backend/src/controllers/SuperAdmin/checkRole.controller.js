import { CompanyUser } from '../../models/CompanyUser.model.js';
import AsyncHandler from '../../utils/AsyncHandler.util.js';
import ApiError from '../../utils/ApiError.util.js';
import ApiResponse from '../../utils/ApiResponse.util.js';
import HTTP_STATUS from '../../constants/httpStatusCodes.constant.js';

// Check the presence of Super_admin
export const requireSuperAdmin = (req) => {
  if (!req.user || req.user.role !== 'super_admin') {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Only Super_admin can access this resource');
  }
};
