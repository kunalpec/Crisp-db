import React, { useEffect, useState } from "react";
import PricingCard from "./PricingCard";
import axios from "axios";
import styles from "./PricingPage.module.css";
import Navbar from "../head/Navbar";
const PricingPage = () => {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/company/plans")
      .then((res) => {
        setPlans(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching plans:", err);
      });
  }, []);

  return (
    <>
    <Navbar/>
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Our Pricing Plans</h2>
        <p className={styles.subtitle}>
          Choose the perfect plan for your business growth.
        </p>
      </div>

      <div className={styles.cardGrid}>
        {plans.map((plan) => (
          <PricingCard key={plan._id} plan={plan} />
        ))}
      </div>
    </div>
    </>
  );
};

export default PricingPage;