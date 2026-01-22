import { Plan } from '../../models/Plan.model.js';
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

/**
 * =========================
 * CREATE PLAN only by super admin
 * =========================
 */
export const createPlan = AsyncHandler(async (req, res) => {
  requireSuperAdmin(req);
  const { name, description, price, billing_cycle, duration } = req.body;

  const isPlanPresent = await Plan.findOne({ name });
  if (isPlanPresent) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Plan already exists');
  }

  const newPlan = await Plan.create({
    name,
    description,
    price,
    billing_cycle,
    duration,
    is_active: true,
  });

  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, newPlan, 'Your plan was created successfully'));
});

/**
 * =========================
 * UPDATE PLAN by super admin
 * Rules:
 * - If plan NOT used → normal update
 * - If plan IS used + critical update → deprecate + create new version
 * =========================
 */
export const updatePlan = AsyncHandler(async (req, res) => {
  requireSuperAdmin(req);
  const { planId } = req.params;
  const updates = req.body;

  const existingPlan = await Plan.findById(planId);
  if (!existingPlan) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Plan not found');
  }

  const companyCount = await Company.countDocuments({ plan_id: planId });

  const isCriticalUpdate = updates.price !== undefined || updates.billing_cycle !== undefined;

  /**
   * CASE 1: Plan in use + critical update
   */
  if (companyCount > 0 && isCriticalUpdate) {
    // Deactivate old plan
    await Plan.findByIdAndUpdate(planId, { is_active: false });

    // Extract base name (Basic-v1 → Basic)
    const baseName = existingPlan.name.split('-v')[0];

    // Find latest version
    const latestVersionPlan = await Plan.findOne({
      name: new RegExp(`^${baseName}-v`),
    }).sort({ createdAt: -1 });

    let nextVersion = 1;
    if (latestVersionPlan) {
      const match = latestVersionPlan.name.match(/-v(\d+)$/);
      if (match) {
        nextVersion = Number(match[1]) + 1;
      }
    }

    // Create new version
    const newPlan = await Plan.create({
      name: `${baseName}-v${nextVersion}`,
      description: updates.description ?? existingPlan.description,
      price: updates.price ?? existingPlan.price,
      billing_cycle: updates.billing_cycle ?? existingPlan.billing_cycle,
      duration: updates.duration ?? existingPlan.duration,
      is_active: true,
    });

    return res.json(
      new ApiResponse(
        HTTP_STATUS.OK,
        {
          deprecated_plan_id: existingPlan._id,
          new_plan: newPlan,
        },
        'Plan was in use. Old plan deprecated and new version created.'
      )
    );
  }

  /**
   * CASE 2: Safe update
   */
  const updatedPlan = await Plan.findByIdAndUpdate(planId, updates, {
    new: true,
    runValidators: true,
  });

  return res.json(new ApiResponse(HTTP_STATUS.OK, updatedPlan, 'Plan updated successfully'));
});

/**
 * =========================
 * DEACTIVATE PLAN by super admin
 * =========================
 */
export const deactivatePlan = AsyncHandler(async (req, res) => {
  requireSuperAdmin(req);
  const { planId } = req.params;

  const plan = await Plan.findByIdAndUpdate(planId, { is_active: false }, { new: true });

  if (!plan) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Plan not found');
  }

  return res.json(
    new ApiResponse(
      HTTP_STATUS.OK,
      plan,
      'Plan deactivated. Existing users can continue until expiry.'
    )
  );
});

/**
 * =========================
 * DELETE PLAN (SAFE CLEANUP) by super admin
 * =========================
 */
export const deletePlan = AsyncHandler(async (req, res) => {
  requireSuperAdmin(req);
  const { planId } = req.params;

  const companyCount = await Company.countDocuments({ plan_id: planId });
  if (companyCount > 0) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Plan still has active companies. Deactivate it first.'
    );
  }

  const plan = await Plan.findByIdAndDelete(planId);
  if (!plan) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Plan not found');
  }

  return res.json(new ApiResponse(HTTP_STATUS.OK, null, 'Plan deleted successfully'));
});

/**
 * =========================
 * AUTO CLEANUP DEPRECATED PLANS auto clean
 * =========================
 */
export const cleanupDeprecatedPlans = async () => {
  try {
    const inactivePlans = await Plan.find({ is_active: false });

    for (const plan of inactivePlans) {
      const companyCount = await Company.countDocuments({
        plan_id: plan._id,
      });

      if (companyCount === 0) {
        await Plan.findByIdAndDelete(plan._id);
        console.log(`✅ Deleted unused plan: ${plan.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Plan cleanup failed:', error.message);
  }
};

/**
 * =========================
 * READ ACTIVE PLANS (FOR USERS) by super admin and Company admin 
 * =========================
 */
export const getActivePlans = AsyncHandler(async (req, res) => {
  let plans;

  if (req.user?.role === 'Super_admin') {
    // Super admin sees all plans
    plans = await Plan.find().sort({ createdAt: -1 });
  } else {
    // Normal users see only active plans
    plans = await Plan.find({ is_active: true }).sort({ createdAt: -1 });
  }

  return res.json(
    new ApiResponse(
      HTTP_STATUS.OK,
      plans,
      'Plans fetched successfully'
    )
  );
});


// ========================
//  PLANS BY ID by super admin and Company admin
// ========================
export const getPlanById = AsyncHandler(async (req, res) => {
  const { id } = req.query;

  if (!id) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Plan id is required');
  }

  const plan = await Plan.findById(id);

  if (!plan) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Plan not found');
  }

  return res.json(new ApiResponse(HTTP_STATUS.OK, plan, 'Plan fetched successfully'));
});
