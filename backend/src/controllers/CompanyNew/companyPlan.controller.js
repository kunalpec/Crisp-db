import { Company } from "../../models/Company.model.js";
import { Plan } from "../../models/Plan.model.js";
import AsyncHandler from "../../utils/AsyncHandler.util.js";
import ApiError from "../../utils/ApiError.util.js";
import ApiResponse from "../../utils/ApiResponse.util.js";
import HTTP_STATUS from "../../constants/httpStatusCodes.constant.js";

/**
 * ======================================================
 * ✅ GET All Plans
 * Route: GET /api/company/plans
 * Access: Admin + Agent
 * ======================================================
 */
export const getAllPlans = AsyncHandler(async (req, res) => {
  const plans = await Plan.find({}).select("-createdAt -updatedAt");
  return res.status(200).json(
    new ApiResponse(200, plans, "Plans retrieved successfully")
  );
});

/**
 * ======================================================
 * ✅ GET Company Plan Details
 * Route: GET /api/company/plan
 * Access: Admin + Agent
 * ======================================================
 */
export const getCompanyPlan = AsyncHandler(async (req, res) => {
  const user = req.user;

  if (!user || !user.company_id) {
    throw new ApiError(401, "User not authenticated");
  }

  const company = await Company.findById(user.company_id).populate("plan_id");

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  return res.status(200).json(
    new ApiResponse(200, company.plan_id, "Company plan retrieved successfully")
  );
});

/**
 * ======================================================
 * ✅ UPDATE Company Plan
 * Route: PATCH /api/company/plan
 * Access: Admin only
 * Body: { planId: String }
 * ======================================================
 */
export const updateCompanyPlan = AsyncHandler(async (req, res) => {
  const user = req.user;
  const { planId } = req.body;

  if (!user || !user.company_id) {
    throw new ApiError(401, "User not authenticated");
  }

  if (user.role !== "company_admin") {
    throw new ApiError(403, "Only company admin can change the plan");
  }

  if (!planId) {
    throw new ApiError(400, "Plan ID is required");
  }

  const plan = await Plan.findById(planId);
  if (!plan) {
    throw new ApiError(404, "Plan not found");
  }

  const company = await Company.findByIdAndUpdate(
    user.company_id,
    { plan_id: plan._id, subscription_status: "active" },
    { new: true }
  ).populate("plan_id");

  return res.status(200).json(
    new ApiResponse(200, company.plan_id, "Company plan updated successfully")
  );
});

/**
 * ======================================================
 * ✅ GET Default Plan
 * Route: GET /api/company/plan/default
 * Access: Admin + Agent
 * ======================================================
 */
export const getDefaultPlan = AsyncHandler(async (req, res) => {
  const defaultPlan = await Plan.findOne({ is_default: true });

  if (!defaultPlan) {
    throw new ApiError(404, "Default plan not found");
  }

  return res.status(200).json(
    new ApiResponse(200, defaultPlan, "Default plan retrieved successfully")
  );
});

