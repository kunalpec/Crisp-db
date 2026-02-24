import Stripe from "stripe";
import { Plan } from "../../models/Plan.model.js";
import { Company } from "../../models/Company.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  const { planId } = req.body;
  const user = req.user;

  if (!user || !user.company_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const plan = await Plan.findById(planId);
  if (!plan) {
    return res.status(404).json({ message: "Plan not found" });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: plan.name,
            description: plan.description,
          },
          unit_amount: plan.price * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      planId: plan._id.toString(),
      companyId: user.company_id.toString(),
    },
    success_url: "http://localhost:3000/payment-success",
    cancel_url: "http://localhost:3000/pricing",
  });

  res.status(200).json({ url: session.url });
};