import { Company } from '../../models/Company.model.js';
import ApiResponse from '../../utils/ApiResponse.util.js';
import ApiError from '../../utils/ApiError.util.js';
import AsyncHandler from '../../utils/AsyncHandler.util.js';

/**
 * Create Provider (System) Company
 */
export const createSuperCompany = AsyncHandler(async (req, res) => {
  const { company_name, company_domain, plan_id = null } = req.body;

  // Validate request payload
  if (!company_name || !company_domain) {
    throw new ApiError(400, 'Company name and company domain are required');
  }

  // Check if provider company already exists
  const existingCompany = await Company.findOne({ is_system: true });

  if (existingCompany) {
    throw new ApiError(400, 'Provider company already exists');
  }

  // Create provider company
  const company = await Company.create({
    name: company_name,
    domain: company_domain,
    is_system: true,
    status: 'active',
    owner_user_id: null,
    plan_id,
  });

  // Send response
  return res.status(201).json(
    new ApiResponse(
      201,
      company,
      'Provider company created successfully'
    )
  );
});
