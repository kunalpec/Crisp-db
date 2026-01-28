import { Company } from '../../models/Company.model.js';
import { CompanyUser } from '../../models/CompanyUser.model.js';
import AsyncHandler from '../../utils/AsyncHandler.util.js';
import ApiResponse from '../../utils/ApiResponse.util.js';
import ApiError from '../../utils/ApiError.util.js';
import HTTP_STATUS from '../../constants/httpStatusCodes.constant.js';

// Check company_admin
export const requireCompanyAdmin = (req) => {
  if (!req.user || req.user.role !== 'company_admin') {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      'Only company admin can access this resource'
    );
  }
};