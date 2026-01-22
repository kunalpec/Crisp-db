import React, { useState, useEffect } from "react";
import styles from "./Pricing.module.css";
import NavBar from "../head/Navbar";
import images from "../../assets/images";
import Footer from "../footer/Footer";
import axios from "axios";

const Pricing = () => {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/plans/")
      .then((res) => {
        setPlans(res.data?.plans || []);
      })
      .catch((err) => {
        console.error("Error fetching plans:", err);
      });
  }, []);

  return (
    <>
      <NavBar />

      {/* Hero Section */}
      <section className={styles.pricingHeroSection}>
        <div className={styles.pricingHeroContainer}>
          <h1 className={styles.pricingHeroTitle}>Discover Our Pricing</h1>
          <p className={styles.pricingHeroSubtitle}>
            Find the perfect package for your business needs.
          </p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className={styles.pricingSection}>
        <div className={styles.pricingHeader}>
          <h1>Pricing Plans</h1>
          <p>
            Each new account gets access to all Mediator features. Try it free for
            14 days and see if it fits your needs!
          </p>
        </div>

        <div className={styles.pricingContainer}>
          {plans.map((plan) => (
            <div key={plan._id} className={styles.pricingCard}>
              <h2>{plan.name}</h2>

              <div className={styles.price}>
                <span className={styles.amount}>
                  {plan.price === 0 ? "Free" : `$${plan.price}`}
                </span>
                {plan.price !== 0 && (
                  <span className={styles.period}>/ month</span>
                )}
              </div>

              <ul className={styles.features}>
                {(plan.features || []).map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>

              <button className={styles.priceButton}>
                {plan.trialDays === 0
                  ? "Get Started"
                  : `Try for ${plan.trialDays} days`}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.excellentSection}>
        <div className={styles.excellentHeader}>
          <button className={styles.featureTag}>FEATURES</button>
          <h2 className={styles.excellentTitle}>
            Excellent Response with{" "}
            <span className={styles.smartAI}>Smart AI</span>
          </h2>
          <p className={styles.excellentSubtitle}>
            Refine chatbot intelligence through continuous learning and
            customization options
          </p>
        </div>

        <div className={styles.excellentGrid}>
          <div className={styles.featureCard}>
            <img
              src={images.pricingFourthSection1}
              alt="Multi Language Support"
              className={styles.cardImage}
            />
            <h3 className={styles.cardTitle}>Multi-Language Support</h3>
            <p className={styles.cardText}>
              Connect with global users with auto-translated messages, ensuring
              smooth conversations in multiple languages.
            </p>
          </div>

          <div className={styles.featureCard}>
            <img
              src={images.pricingFourthSection2}
              alt="AI Training Center"
              className={styles.cardImage}
            />
            <h3 className={styles.cardTitle}>AI Training Center</h3>
            <p className={styles.cardText}>
              Continuously improve your chatbot’s intelligence with a dedicated
              training space.
            </p>
          </div>

          <div className={styles.featureCard}>
            <img
              src={images.pricingFourthSection3}
              alt="Customer Insights"
              className={styles.cardImage}
            />
            <h3 className={styles.cardTitle}>Personal Customer Insights</h3>
            <p className={styles.cardText}>
              Gain valuable insights as AI learns customer preferences for a
              better support experience.
            </p>
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className={styles.container}>
        <div className={styles.heroSection}>
          <div className={styles.contentLeft}>
            <button className={styles.ctaButton}>GET ROI FAST</button>
            <h1 className={styles.heading}>
              Automate Business,{" "}
              <span className={styles.highlight}>Stream</span> More Revenue
            </h1>
            <p className={styles.description}>
              HAIchat is an innovative AI chatbot service designed to automate
              customer support, improve lead generation, and boost engagement.
            </p>

            <div className={styles.pricingStats}>
              <div className={styles.pricingCard}>
                <div className={styles.pricingValue}>68%</div>
                <div className={styles.pricingLabel}>
                  Operating Cost Efficiency
                </div>
              </div>

              <div className={styles.pricingCard}>
                <div className={styles.pricingValue}>201+</div>
                <div className={styles.pricingLabel}>
                  Businesses Trust Us
                </div>
              </div>
            </div>
          </div>

          <div className={styles.imageSection}>
            <img
              src={images.pricingImg}
              alt="Business Analytics"
            />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Pricing;
