import React from "react";
import styles from "./HeroSection.module.css";

const HeroSection = () => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.container}>
        <p className={styles.subHeading}>POWERFUL SOLUTION</p>
        <h1 className={styles.heading}>
          Talk to Tomorrow’s <br />
          <span className={styles.gradientUnderline}>Technology</span>
        </h1>
        <p className={styles.description}>
          Experience the future of seamless communication with our AI chatbot.
        </p>
        <button className={styles.button}>Get started</button>
      </div>
    </section>
  );
};

export default HeroSection;
