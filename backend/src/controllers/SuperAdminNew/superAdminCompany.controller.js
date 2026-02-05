import mongoose from "mongoose";
import { Company } from "../../models/Company.model.js";
import { CompanyUser } from "../../models/CompanyUser.model.js";

import ApiResponse from "../../utils/ApiResponse.util.js";
import ApiError from "../../utils/ApiError.util.js";
import AsyncHandler from "../../utils/AsyncHandler.util.js";

/**
 * ======================================================
 * ✅ GET ALL ACTIVE COMPANIES (Super Admin Only)
 * Route: GET /api/superadmin/companies
 * Access: Protected (Super Admin)
 * Features:
 *  - Pagination
 *  - Search by name/domain
 *  - Only active companies
 * ======================================================
 */
export const getAllActiveCompanies = AsyncHandler(async (req, res) => {
  // ✅ Query Params
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  const search = req.query.search?.trim() || "";

  // ✅ Build Filter
  const filter = {
    is_system: false, // exclude provider company
    status: "active",
  };

  // ✅ Search Support (Company Name / Domain)
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { domain: { $regex: search, $options: "i" } },
    ];
  }

  // ✅ Pagination Calculation
  const skip = (page - 1) * limit;

  // ✅ Fetch Total Count
  const totalCompanies = await Company.countDocuments(filter);

  // ✅ Fetch Companies
  const companies = await Company.find(filter)
    .select(
      "-billing_customer_id -api_key_id" // hide sensitive
    )
    .populate({
      path: "plan_id",
      select: "name price duration status",
    })
    .populate({
      path: "owner_user_id",
      select: "username email role phone_number",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // ✅ Pagination Meta
  const totalPages = Math.ceil(totalCompanies / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        companies,
        pagination: {
          totalCompanies,
          totalPages,
          currentPage: page,
          limit,
        },
      },
      "Active companies fetched successfully"
    )
  );
});

/**
 * ======================================================
 * ✅ GET SINGLE COMPANY DETAILS
 * Route: GET /api/superadmin/companies/:companyId
 * Access: Protected (Super Admin)
 * ======================================================
 */
export const getCompanyById = AsyncHandler(async (req, res) => {
  const { companyId } = req.params;

  // ✅ Validate MongoDB ID
  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    throw new ApiError(400, "Invalid company ID");
  }

  // ✅ Find Company
  const company = await Company.findById(companyId)
    .populate("plan_id", "name price duration status")
    .populate("owner_user_id", "username email role phone_number");

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  return res.status(200).json(
    new ApiResponse(200, company, "Company fetched successfully")
  );
});

/**
 * ======================================================
 * ✅ SUSPEND / BLOCK COMPANY
 * Route: PATCH /api/superadmin/companies/:companyId/status
 * Body: { status: "suspended" | "blocked" | "active" }
 * Access: Protected (Super Admin)
 * ======================================================
 */
export const updateCompanyStatus = AsyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const { status } = req.body;

  // ✅ Allowed Status Values
  const allowedStatus = ["active", "inactive", "suspended", "blocked"];

  if (!allowedStatus.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status. Allowed: ${allowedStatus.join(", ")}`
    );
  }

  // ✅ Find Company
  const company = await Company.findById(companyId);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  // ❌ Prevent modifying system provider company
  if (company.is_system) {
    throw new ApiError(403, "System company cannot be modified");
  }

  company.status = status;
  await company.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: company._id,
        name: company.name,
        domain: company.domain,
        status: company.status,
      },
      "Company status updated successfully"
    )
  );
});

/**
 * ======================================================
 * ✅ DELETE COMPANY (Only if No Users Exist)
 * Route: DELETE /api/superadmin/companies/:companyId
 * Access: Protected (Super Admin)
 * ======================================================
 */
export const deleteCompany = AsyncHandler(async (req, res) => {
  const { companyId } = req.params;

  // ✅ Validate ID
  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    throw new ApiError(400, "Invalid company ID");
  }

  // ✅ Find Company
  const company = await Company.findById(companyId);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  // ❌ Prevent deleting provider company
  if (company.is_system) {
    throw new ApiError(403, "System company cannot be deleted");
  }

  // ✅ Check if company has users
  const userCount = await CompanyUser.countDocuments({
    company_id: company._id,
  });

  if (userCount > 0) {
    throw new ApiError(
      400,
      "Company cannot be deleted because users exist under it"
    );
  }

  // ✅ Delete Company
  await Company.deleteOne({ _id: company._id });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Company deleted successfully"));
});
