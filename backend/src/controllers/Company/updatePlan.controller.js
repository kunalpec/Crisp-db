import { Company } from '../../models/Company.model.js';
import { Plan } from '../../models/Plan.model.js';
import { ApiKey } from '../../models/ApiKey.model.js';
import ApiError from '../../utils/ApiError.util.js';
import ApiResponse from '../../utils/ApiResponse.util.js';
import AsyncHandler from '../../utils/AsyncHandler.util.js';

/**
 * Recharge or Change Company Plan
 * - Same plan  → Recharge
 * - New plan   → Change plan
 * - API key remains same, expiry updated
 */
export const updateCompanyPlan = AsyncHandler(async (req, res) => {
  const { plan_id } = req.body;
  const user = req.user;

  // ✅ Role check
  if (user.role !== 'company_admin') {
    throw new ApiError(403, 'Only company admin can update the plan');
  }

  if (!plan_id) {
    throw new ApiError(400, 'Plan ID is required');
  }

  // ✅ Validate plan
  const plan = await Plan.findOne({
    _id: plan_id,
    is_active: true,
  });

  if (!plan) {
    throw new ApiError(404, 'Plan not found or inactive');
  }

  // ✅ Fetch company
  const company = await Company.findById(user.company_id);
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }

  // ✅ Calculate API key validity
  const start_at = new Date();
  let expires_at = new Date(start_at);

  if (plan.billing_cycle === 'monthly') {
    expires_at.setMonth(expires_at.getMonth() + plan.duration);
  } else if (plan.billing_cycle === 'yearly') {
    expires_at.setFullYear(expires_at.getFullYear() + plan.duration);
  }

  // ✅ Fetch API key (must already exist)
  const apiKey = await ApiKey.findOne({
    company_id: company._id,
  });

  if (!apiKey) {
    throw new ApiError(404, 'API key not found for company');
  }

  // ✅ Update API key validity
  apiKey.start_at = start_at;
  apiKey.expires_at = expires_at;
  await apiKey.save();

  // ✅ Check recharge vs change
  const isSamePlan =
    company.plan_id &&
    company.plan_id.toString() === plan_id;

  // ✅ Update company plan
  company.plan_id = plan._id;
  await company.save();

  return res.json(
    new ApiResponse(
      200,
      {
        company_id: company._id,
        company_name: company.name,
        action: isSamePlan ? 'recharge' : 'plan_changed',
        plan: {
          id: plan._id,
          name: plan.name,
          billing_cycle: plan.billing_cycle,
          duration: plan.duration,
        },
        api_key_validity: {
          start_at,
          expires_at,
        },
      },
      isSamePlan
        ? 'Plan recharged successfully'
        : 'Company plan updated successfully'
    )
  );
});
