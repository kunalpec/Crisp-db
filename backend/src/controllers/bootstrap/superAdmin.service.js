import { Company } from '../../models/Company.model.js';
import { CompanyUser } from '../../models/CompanyUser.model.js';
import ApiResponse from '../../utils/ApiResponse.util.js';
import ApiError from '../../utils/ApiError.util.js';
import AsyncHandler from '../../utils/AsyncHandler.util.js';

/**
 * Create Super Admin
 * Scope: Provider (System) Company Only
 */
export const createSuperAdmin = AsyncHandler(async (req, res) => {
  const { username, email, password , phone_number } = req.body;

  // Validate request payload
  if (!username || !email || !password  || !phone_number) {
    throw new ApiError(400, 'Username, email, password and phone number are required');
  }

  // Fetch provider (system) company
  const company = await Company.findOne({ is_system: true });

  if (!company) {
    throw new ApiError(404, 'Provider company does not exist');
  }

  // Check if a super admin already exists
  const existingSuperAdmin = await CompanyUser.findOne({
    company_id: company._id,
    role: 'super_admin',
  });

  if (existingSuperAdmin) {
    throw new ApiError(400, 'Super admin already exists');
  }

  // Create super admin user
  const superAdmin = await CompanyUser.create({
    company_id: company._id,
    username,
    email,
    password_hash: password, // Password is hashed via pre-save hook
    phone_number,
    role: 'super_admin',
  });

  // Assign owner if not already set
  if (!company.owner_user_id) {
    company.owner_user_id = superAdmin._id;
    await company.save();
  }

  // Send safe response without sensitive data
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        _id: superAdmin._id,
        username: superAdmin.username,
        email: superAdmin.email,
        role: superAdmin.role,
        phone_number : superAdmin.phone_number
      },
      'Super admin created successfully'
    )
  );
});

/**
 * Delete Super Admin
 * Scope: Provider (System) Company Only
 */
export const deleteSuperAdmin = AsyncHandler(async (req, res) => {
  // Fetch provider (system) company
  const systemCompany = await Company.findOne({ is_system: true });

  if (!systemCompany) {
    throw new ApiError(404, 'Provider company not found');
  }

  // Locate super admin user
  const superAdmin = await CompanyUser.findOne({
    company_id: systemCompany._id,
    role: 'super_admin',
  });

  if (!superAdmin) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Super admin does not exist'));
  }

  // Remove super admin user
  await CompanyUser.deleteOne({ _id: superAdmin._id });

  // Clear owner reference from company
  systemCompany.owner_user_id = null;
  await systemCompany.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Super admin deleted successfully'));
});
