import { CompanyUser } from '../../models/CompanyUser.model.js';
import { Company } from '../../models/Company.model.js';
import { Plan } from '../../models/Plan.model.js';
import { ApiKey } from '../../models/ApiKey.model.js';
import AsyncHandler from '../../utils/AsyncHandler.util.js';
import ApiError from '../../utils/ApiError.util.js';
import ApiResponse from '../../utils/ApiResponse.util.js';
import HTTP_STATUS from '../../constants/httpStatusCodes.constant.js';


// Allow only company admin
export const requireCompanyAdmin = (req) => {
  if (!req.user || req.user.role !== 'super_admin') {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      'Only company admin can access this resource'
    );
  }
};

// Get Api Key for Company only access by Company Admin
export const getApiKey = AsyncHandler(async (req, res) => {
  // Only company admin allowed
  requireCompanyAdmin(req);

  const companyId = req.user.company_id;

  if (!companyId) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Company not linked to user'
    );
  }

  // Get active API key for company
  const apiKey = await ApiKey.findOne({
    company_id: companyId,
    is_active: true,
  }).select('-api_key_hash'); // hide secret hash

  if (!apiKey) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'API key not found'
    );
  }

  return res.json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        id: apiKey._id,
        company_id: apiKey.company_id,
        start_at: apiKey.start_at,
        expires_at: apiKey.expires_at,
        is_active: apiKey.is_active,
      },
      'API key fetched successfully'
    )
  );
});
