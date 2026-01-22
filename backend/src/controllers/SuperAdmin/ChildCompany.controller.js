import { Company } from '../../models/Company.model.js';
import AsyncHandler from '../../utils/AsyncHandler.util.js';
import ApiError from '../../utils/ApiError.util.js';
import ApiResponse from '../../utils/ApiResponse.util.js';
import HTTP_STATUS from '../../constants/httpStatusCodes.constant.js';


// Check the presence of Super_admin
const requireSuperAdmin = (req) => {
  if (!req.user || req.user.role !== 'Super_admin') {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Only Super_admin can access this resource');
  }
};

// =========================
// GET ALL ACTIVE COMPANIES SuperAdmin only
// =========================
export const getAllActiveCompanies = AsyncHandler(async (req, res) => {
  requireSuperAdmin (req);
  const companies = await Company.find({
    status: 'active',
  })
    .populate('plan_id')       // optional but useful
    .populate('owner_user_id') // optional
    .sort({ createdAt: -1 });

  if (!companies.length) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'No active companies found'
    );
  }

  return res.json(
    new ApiResponse(
      HTTP_STATUS.OK,
      companies,
      'Active companies fetched successfully'
    )
  );
});


