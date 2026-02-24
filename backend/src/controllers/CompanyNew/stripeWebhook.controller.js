import Stripe from "stripe";
import { Company } from "../../models/Company.model.js";
import { Plan } from "../../models/Plan.model.js";
import AsyncHandler from "../../utils/AsyncHandler.util.js";
import ApiError from "../../utils/ApiError.util.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Stripe Webhook for handling payments and updating company plan
 */
export const stripeWebhook = AsyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Handle checkout session completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const planId = session.metadata.planId;
    const companyId = session.metadata.companyId;

    if (!planId || !companyId) {
      console.error("Missing planId or companyId in webhook metadata");
      return res.status(400).send("Missing planId or companyId");
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      console.error("Plan not found during webhook:", planId);
      return res.status(404).send("Plan not found");
    }

    const company = await Company.findById(companyId);
    if (!company) {
      console.error("Company not found during webhook:", companyId);
      return res.status(404).send("Company not found");
    }

    // Update company plan using same logic as updateCompanyPlan
    company.plan_id = plan._id;
    company.subscription_status = "active";
    company.subscription_start_date = new Date();

    await company.save();

    console.log(`✅ Company (${companyId}) plan updated to ${plan.name}`);
  }

  res.status(200).json({ received: true });
});