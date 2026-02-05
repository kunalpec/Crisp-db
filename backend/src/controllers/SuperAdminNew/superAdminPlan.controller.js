import mongoose from "mongoose";
import { Plan } from "../../models/Plan.model.js";
import { Company } from "../../models/Company.model.js";

import ApiResponse from "../../utils/ApiResponse.util.js";
import ApiError from "../../utils/ApiError.util.js";
import AsyncHandler from "../../utils/AsyncHandler.util.js";

/**
 * ======================================================
 * ✅ CREATE NEW PLAN
 * POST /api/superadmin/plans
 * ======================================================
 */
export const createPlan = AsyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    billing_cycle,
    duration_in_days,
    max_agents,
    max_conversations_per_month,
    max_ai_tokens,
    features,
    is_default,
    is_active,
  } = req.body;

  // ✅ Required Validation
  if (!name || price === undefined || !billing_cycle || !duration_in_days) {
    throw new ApiError(
      400,
      "Name, price, billing_cycle and duration_in_days are required"
    );
  }

  // ✅ Duplicate Check
  const existing = await Plan.findOne({ name: name.trim() });
  if (existing) {
    throw new ApiError(400, "Plan with this name already exists");
  }

  // ✅ If default plan, remove old default
  if (is_default === true) {
    await Plan.updateMany({ is_default: true }, { is_default: false });
  }

  // ✅ Create Plan
  const plan = await Plan.create({
    name: name.trim(),
    description: description || "",
    price,
    billing_cycle,
    duration_in_days,

    max_agents: max_agents ?? 1,
    max_conversations_per_month: max_conversations_per_month ?? 100,
    max_ai_tokens: max_ai_tokens ?? 50000,

    features: features || [],
    is_default: is_default ?? false,
    is_active: is_active ?? true,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, plan, "Plan created successfully"));
});

/**
 * ======================================================
 * ✅ UPDATE PLAN
 * PATCH /api/superadmin/plans/:planId
 * ======================================================
 */
export const updatePlan = AsyncHandler(async (req, res) => {
  const { planId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(planId)) {
    throw new ApiError(400, "Invalid Plan ID");
  }

  const plan = await Plan.findById(planId);
  if (!plan) {
    throw new ApiError(404, "Plan not found");
  }

  const {
    name,
    description,
    price,
    billing_cycle,
    duration_in_days,
    max_agents,
    max_conversations_per_month,
    max_ai_tokens,
    features,
    is_default,
    is_active,
  } = req.body;

  // ✅ Update Fields Only If Provided
  if (name) plan.name = name.trim();
  if (description !== undefined) plan.description = description;
  if (price !== undefined) plan.price = price;
  if (billing_cycle) plan.billing_cycle = billing_cycle;
  if (duration_in_days) plan.duration_in_days = duration_in_days;

  if (max_agents !== undefined) plan.max_agents = max_agents;
  if (max_conversations_per_month !== undefined)
    plan.max_conversations_per_month = max_conversations_per_month;
  if (max_ai_tokens !== undefined) plan.max_ai_tokens = max_ai_tokens;

  if (features) plan.features = features;

  // ✅ Default Plan Logic
  if (is_default === true) {
    await Plan.updateMany({ is_default: true }, { is_default: false });
    plan.is_default = true;
  }

  if (is_active !== undefined) {
    plan.is_active = is_active;
  }

  await plan.save();

  return res
    .status(200)
    .json(new ApiResponse(200, plan, "Plan updated successfully"));
});

/**
 * ======================================================
 * ✅ DEACTIVATE PLAN
 * PATCH /api/superadmin/plans/:planId/deactivate
 * ======================================================
 */
export const deactivatePlan = AsyncHandler(async (req, res) => {
  const { planId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(planId)) {
    throw new ApiError(400, "Invalid Plan ID");
  }

  const plan = await Plan.findById(planId);
  if (!plan) throw new ApiError(404, "Plan not found");

  plan.is_active = false;
  await plan.save();

  return res
    .status(200)
    .json(new ApiResponse(200, plan, "Plan deactivated successfully"));
});

/**
 * ======================================================
 * ✅ ACTIVATE PLAN
 * PATCH /api/superadmin/plans/:planId/activate
 * ======================================================
 */
export const activatePlan = AsyncHandler(async (req, res) => {
  const { planId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(planId)) {
    throw new ApiError(400, "Invalid Plan ID");
  }

  const plan = await Plan.findById(planId);
  if (!plan) throw new ApiError(404, "Plan not found");

  plan.is_active = true;
  await plan.save();

  return res
    .status(200)
    .json(new ApiResponse(200, plan, "Plan activated successfully"));
});

/**
 * ======================================================
 * ✅ DELETE PLAN
 * DELETE /api/superadmin/plans/:planId
 * ======================================================
 */
export const deletePlan = AsyncHandler(async (req, res) => {
  const { planId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(planId)) {
    throw new ApiError(400, "Invalid Plan ID");
  }

  const plan = await Plan.findById(planId);
  if (!plan) throw new ApiError(404, "Plan not found");

  // ✅ Prevent delete if plan is assigned
  const companiesUsing = await Company.countDocuments({
    plan_id: plan._id,
  });

  if (companiesUsing > 0) {
    throw new ApiError(
      400,
      "Plan cannot be deleted because companies are subscribed to it"
    );
  }

  await plan.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Plan deleted successfully"));
});

/**
 * ======================================================
 * ✅ GET ALL ACTIVE PLANS
 * GET /api/superadmin/plans/active
 * ======================================================
 */
export const getActivePlans = AsyncHandler(async (req, res) => {
  const plans = await Plan.find({ is_active: true }).sort({ price: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, plans, "Active plans fetched successfully"));
});

/**
 * ======================================================
 * ✅ GET PLAN BY ID
 * GET /api/superadmin/plans/:planId
 * ======================================================
 */
export const getPlanById = AsyncHandler(async (req, res) => {
  const { planId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(planId)) {
    throw new ApiError(400, "Invalid Plan ID");
  }

  const plan = await Plan.findById(planId);
  if (!plan) throw new ApiError(404, "Plan not found");

  return res
    .status(200)
    .json(new ApiResponse(200, plan, "Plan fetched successfully"));
});

/**
 * ======================================================
 * ✅ GET ALL PLANS (Pagination + Search)
 * GET /api/superadmin/plans?page=1&limit=10&search=free
 * ======================================================
 */
export const getAllPlans = AsyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  const search = req.query.search?.trim() || "";

  const filter = search
    ? { name: { $regex: search, $options: "i" } }
    : {};

  const skip = (page - 1) * limit;

  const totalPlans = await Plan.countDocuments(filter);

  const plans = await Plan.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        plans,
        pagination: {
          totalPlans,
          totalPages: Math.ceil(totalPlans / limit),
          currentPage: page,
          limit,
        },
      },
      "Plans fetched successfully"
    )
  );
});
