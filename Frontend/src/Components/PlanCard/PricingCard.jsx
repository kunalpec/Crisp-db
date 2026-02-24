import React from "react";
import {
  FaUserTie,
  FaComments,
  FaRobot,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import styles from "./PricingCard.module.css";
import { useNavigate } from "react-router";
import axios from "axios";

const PricingCard = ({ plan }) => {

  const handleCheckout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/company/create-checkout-session",
        { planId: plan._id },
        { withCredentials: true }
      );

      window.location.href = response.data.url; // Redirect to Stripe
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };
  return (
    <div
      className={`${styles.card} ${plan.is_default ? styles.popularCard : ""
        }`}
    >
      {plan.is_default && (
        <div className={styles.badge}>Most Popular</div>
      )}

      <h3 className={styles.planName}>{plan.name}</h3>

      <div className={styles.priceContainer}>
        <span className={styles.currency}>₹</span>
        <span className={styles.price}>{plan.price}</span>
        <span className={styles.billing}>
          / {plan.billing_cycle}
        </span>
      </div>

      <p className={styles.description}>{plan.description}</p>

      <div className={styles.limits}>
        <div>
          <FaUserTie className={styles.limitIcon} />
          <span>Max Agents:</span>
          <strong>{plan.max_agents}</strong>
        </div>

        <div>
          <FaComments className={styles.limitIcon} />
          <span>Conversations:</span>
          <strong>{plan.max_conversations_per_month}</strong>
        </div>

        <div>
          <FaRobot className={styles.limitIcon} />
          <span>AI Tokens:</span>
          <strong>{plan.max_ai_tokens}</strong>
        </div>

        <div>
          <FaClock className={styles.limitIcon} />
          <span>Duration:</span>
          <strong>{plan.duration_in_days} days</strong>
        </div>
      </div>

      <ul className={styles.features}>
        {plan.features.map((feature, index) => (
          <li key={index}>
            <FaCheckCircle className={styles.checkIcon} />
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={handleCheckout}
        className={`${styles.button} ${plan.is_default ? styles.popularButton : ""
          }`}
      >
        Get Started
      </button>
    </div>
  );
};

export default PricingCard;