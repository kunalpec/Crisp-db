import { CompanyUser } from '../../models/CompanyUser.model.js';
import AsyncHandler from '../../utils/AsyncHandler.util.js';
import ApiResponse from '../../utils/ApiResponse.util.js';
import ApiError from '../../utils/ApiError.util.js';
import HTTP_STATUS from '../../constants/httpStatusCodes.constant.js';
import { requireCompanyAdmin } from './checkRole.controller.js';

export const getEmployee = AsyncHandler(async (req, res) => {
  // 🔐 Allow only company admin
  requireCompanyAdmin(req);

  const companyId = req.user.company_id;

  if (!companyId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Company not linked to user');
  }

  // 👥 Fetch employees
  const employees = await CompanyUser.find({
    company_id: companyId,
    role: { $in: ['company_admin', 'company_agent'] }, // optional: exclude admin
  })
    .select('-password -refreshToken') // hide sensitive fields
    .sort({ createdAt: -1 })
    .populate();

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      employees, // can be []
      'Employees fetched successfully'
    )
  );
});
