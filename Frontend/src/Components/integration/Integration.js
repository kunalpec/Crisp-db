import React from "react";
import styles from "./integrationnextsection.module.css";
import Navbar from "../head/Navbar";
import images from "../../assets/images";

const Integration = () => {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className={styles.integrationWrapper}>
        <div className={styles.integrationContent}>
          <h1 className={styles.integrationTitle}>
            <span className={styles.integrationPart1}>INNOVATIVE</span>
            <br />
            <span className={styles.integrationPart2}>AI</span>
            <span className={styles.integrationPart3}>
              <i>SOLUTIONS</i>
            </span>
          </h1>
        </div>

        <div className={styles.integrationBackground}>
          <img
            src={images.integrationHero}
            alt="Innovative AI background"
            className={styles.integrationImage}
          />
        </div>
      </section>

      {/* Projects Section */}
      <section className={styles.integrationNext}>
        <div className={styles.pageLayout}>
          <header className={styles.headerSection}>
            <span className={styles.titleIcon}>✨</span>
            <h1 className={styles.mainTitle}>PROJECTS</h1>
          </header>

          <div className={styles.contentArea}>
            {/* Project 1 */}
            <article className={styles.projectPanel}>
              <div className={styles.integrationimage}>
                <img
                  src={images.integrationImage}
                  alt="Machine learning project"
                  className={styles.projectVisual}
                />
              </div>
              <div className={styles.projectDetails}>
                <span className={styles.dateLabel}>25 July, 2024</span>
                <h2 className={styles.projectHeading}>Machine Learning</h2>
                <p className={styles.projectText}>
                  Duis sagittis risus ac magna. Advanced machine learning
                  solutions designed for scalability.
                </p>
                <a href="#" className={styles.actionLink}>
                  Explore Now ›
                </a>
              </div>
            </article>

            {/* Project 2 */}
            <article className={styles.projectPanel}>
              <div className={styles.projectDetails}>
                <span className={styles.dateLabel}>25 July, 2024</span>
                <h2 className={styles.projectHeading}>Machine Learning</h2>
                <p className={styles.projectText}>
                  Duis sagittis risus ac magna. Intelligent systems built for
                  modern businesses.
                </p>
                <a href="#" className={styles.actionLink}>
                  Explore Now ›
                </a>
              </div>
              <div className={styles.integrationimage}>
                <img
                  src={images.integrationImage2}
                  alt="AI analytics project"
                  className={styles.projectVisual}
                />
              </div>
            </article>

            {/* Project 3 */}
            <article className={styles.projectPanel}>
              <div className={styles.integrationimage}>
                <img
                  src={images.integrationImage3}
                  alt="AI automation project"
                  className={styles.projectVisual}
                />
              </div>
              <div className={styles.projectDetails}>
                <span className={styles.dateLabel}>25 July, 2024</span>
                <h2 className={styles.projectHeading}>Machine Learning</h2>
                <p className={styles.projectText}>
                  Duis sagittis risus ac magna. Automation-powered AI solutions
                  for growth.
                </p>
                <a href="#" className={styles.actionLink}>
                  Explore Now ›
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Support Cards */}
      <section className={styles.container}>
        <div className={`${styles.card} ${styles.docs}`}>
          <h2>Online Docs</h2>
          <p>
            Explore comprehensive guides and API references to integrate and
            manage the chatbot easily.
          </p>
          <button className={styles.button}>View Documentation</button>
        </div>

        <div className={`${styles.card} ${styles.support}`}>
          <h2>Dedicated Support</h2>
          <p>
            Need help with chatbot setup or queries? Our team is available 24/7
            to provide support.
          </p>
          <button className={styles.button}>Get Support</button>
        </div>

        <div className={`${styles.card} ${styles.updates}`}>
          <h2>Regular Updates</h2>
          <p>
            We continuously enhance our chatbot with new features, performance
            improvements, and security patches.
          </p>
          <button className={styles.button}>Update Now</button>
        </div>
      </section>
    </>
  );
};

export default Integration;
