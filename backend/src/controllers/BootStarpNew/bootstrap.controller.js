import { Company } from "../../models/Company.model.js";
import { SuperAdmin } from "../../models/SuperAdmin.model.js";
import ApiResponse from "../../utils/ApiResponse.util.js";
import ApiError from "../../utils/ApiError.util.js";
import AsyncHandler from "../../utils/AsyncHandler.util.js";

/**
 * ✅ 1. Create Provider (System) Company
 * Only runs ONCE
 */
export const createSuperCompany = AsyncHandler(async (req, res) => {
  const { company_name, company_domain, plan_id = null } = req.body;

  if (!company_name || !company_domain) {
    throw new ApiError(400, "Company name and domain are required");
  }

  // Check if system company already exists
  const existing = await Company.findOne({ is_system: true });

  if (existing) {
    throw new ApiError(400, "Provider company already exists");
  }

  // Create system company
  const company = await Company.create({
    name: company_name,
    domain: company_domain,
    is_system: true,
    status: "active",
    owner_user_id: null,
    plan_id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, company, "Provider company created successfully"));
});

/**
 * ✅ 2. Create First Super Admin (System Owner)
 * Runs ONLY ONCE
 */
export const createSuperAdmin = AsyncHandler(async (req, res) => {
  const { username, email, password, phone_number } = req.body;

  // ✅ Basic Validation
  if (!username || !email || !password) {
    throw new ApiError(400, "Username, email and password are required");
  }

  // ✅ Phone Validation
  if (!phone_number?.country_code || !phone_number?.number) {
    throw new ApiError(
      400,
      "Phone number must include country_code and number"
    );
  }

  // ✅ Ensure System Company Exists
  const systemCompany = await Company.findOne({ is_system: true });

  if (!systemCompany) {
    throw new ApiError(
      404,
      "Provider company does not exist. Create company first."
    );
  }

  // ✅ Check if Super Admin already exists
  const existingAdmin = await SuperAdmin.findOne();

  if (existingAdmin) {
    throw new ApiError(400, "Super admin already exists");
  }

  // ✅ Create Super Admin
  const superAdmin = await SuperAdmin.create({
    username,
    email,
    password,
    phone_number,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        _id: superAdmin._id,
        username: superAdmin.username,
        email: superAdmin.email,
        phone_number: superAdmin.phone_number,
        role: superAdmin.role,
      },
      "Super admin created successfully"
    )
  );
});

/**
 * ✅ 3. Bootstrap Status Checker
 * GET /api/bootstrap/status
 */
export const getBootstrapStatus = AsyncHandler(async (req, res) => {
  const systemCompany = await Company.findOne({ is_system: true });

  if (!systemCompany) {
    return res.status(200).json(
      new ApiResponse(200, {
        systemCompany: false,
        superAdmin: false,
      })
    );
  }

  // ✅ Check SuperAdmin Exists
  const superAdmin = await SuperAdmin.findOne();

  return res.status(200).json(
    new ApiResponse(200, {
      systemCompany: true,
      superAdmin: !!superAdmin,
    })
  );
});
