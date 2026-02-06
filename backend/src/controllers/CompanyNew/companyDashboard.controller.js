import { Company } from "../../models/Company.model.js";
import { CompanyUser } from "../../models/CompanyUser.model.js";
import { Plan } from "../../models/Plan.model.js";

import AsyncHandler from "../../utils/AsyncHandler.util.js";
import ApiError from "../../utils/ApiError.util.js";
import ApiResponse from "../../utils/ApiResponse.util.js";
import HTTP_STATUS from "../../constants/httpStatusCodes.constant.js";

/**
 * ======================================================
 * ✅ Get Company Dashboard Info
 * Route: GET /api/company/dashboard
 * Access: Company Admin
 * ======================================================
 */
export const getCompanyDashboard = AsyncHandler(async (req, res) => {
  const user = req.user;

  if (!user || user.role !== "company_admin") {
    throw new ApiError(401, "Unauthorized");
  }

  // ✅ Fetch company
  const company = await Company.findById(user.company_id)
    .populate("plan_id", "-__v")
    .populate("owner_user_id", "username email role phone_number")
    .lean();

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  // ✅ Count total employees
  const employeesCount = await CompanyUser.countDocuments({
    company_id: company._id,
    role: "company_agent",
  });

  // ✅ Fetch all employees
  const employees = await CompanyUser.find({
    company_id: company._id,
    role: "company_agent",
  })
    .select("username email role phone_number is_online createdAt")
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        company,
        total_employees: employeesCount,
        employees,
      },
      "Company dashboard fetched successfully"
    )
  );
});

/**
 * ======================================================
 * ✅ Get Company Plan Info
 * Route: GET /api/company/dashboard/plan
 * Access: Company Admin + Agent
 * ======================================================
 */
export const getCompanyPlan = AsyncHandler(async (req, res) => {
  const user = req.user;

  // ✅ Fetch company
  const company = await Company.findById(user.company_id)
    .populate("plan_id")
    .lean();

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  if (!company.plan_id) {
    throw new ApiError(404, "Plan not assigned to company");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        plan: company.plan_id,
        subscription_status: company.subscription_status,
        subscription_expiry: company.subscription_expiry,
      },
      "Company plan info fetched successfully"
    )
  );
});

/**
 * ======================================================
 * ✅ Update Company Status (Admin only)
 * Route: PATCH /api/company/dashboard/status
 * Access: Super Admin
 * ======================================================
 */
export const updateCompanyStatus = AsyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !["active", "inactive", "suspended", "blocked"].includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  const company = await Company.findById(req.params.companyId);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  company.status = status;
  await company.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      company,
      `Company status updated to ${status}`
    )
  );
});

/**
 * ======================================================
 * ✅ Get Employees List
 * Route: GET /api/company/dashboard/employees
 * Access: Company Admin
 * ======================================================
 */
// export const getEmployeesList = AsyncHandler(async (req, res) => {
//   const user = req.user;

//   if (!user || user.role !== "company_admin") {
//     throw new ApiError(401, "Unauthorized");
//   }

//   const employees = await CompanyUser.find({
//     company_id: user.company_id,
//   })
//     .select("username email role phone_number is_online createdAt")
//     .lean();

//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       { employees, total: employees.length },
//       "Employees list fetched successfully"
//     )
//   );
// });
