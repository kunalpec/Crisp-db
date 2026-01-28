import { Company } from '../../models/Company.model.js';
import AsyncHandler from '../../utils/AsyncHandler.util.js';
import ApiError from '../../utils/ApiError.util.js';
import ApiResponse from '../../utils/ApiResponse.util.js';
import HTTP_STATUS from '../../constants/httpStatusCodes.constant.js';
import { requireSuperAdmin } from './checkRole.controller.js';
import { ApiKey } from '../../models/ApiKey.model.js';

// =========================
// GET ALL ACTIVE COMPANIES (SuperAdmin only)
// =========================
export const getAllActiveCompanies = AsyncHandler(async (req, res) => {
  requireSuperAdmin(req);

  const companies = await Company.find({
    status: 'active',is_system:false
  })
    .populate('plan_id')
    .populate('owner_user_id')
    .sort({ createdAt: -1 });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      companies, // can be []
      'Active companies fetched successfully'
    )
  );
});


// auto deactivate the company
export const autoDeactivateCompaniesJob = async () => {
  const now = new Date();

  console.log('🔍 Checking company API key expiry...');

  const companies = await Company.find({
    status: 'active',
    is_system: false,
  }).select('_id name');

  let deactivated = 0;

  for (const company of companies) {
    const validApiKey = await ApiKey.findOne({
      company_id: company._id,
      $or: [
        { expires_at: null },
        { expires_at: { $gt: now } },
      ],
    });

    if (!validApiKey) {
      await Company.findByIdAndUpdate(company._id, {
        status: 'inactive',
      });

      console.log(`❌ Deactivated: ${company.name}`);
      deactivated++;
    }
  }

  console.log(`✅ Deactivation job finished. Total: ${deactivated}`);
};

