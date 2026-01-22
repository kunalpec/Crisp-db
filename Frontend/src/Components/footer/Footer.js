import React from "react";
import styles from "./Footer.module.css";
import images from "../../assets/images";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* Brand & Socials */}
      <div className={styles.section}>
        <div className={styles.logoContainer}>
          <span className={styles.logoText}>CRISP</span>
        </div>

        <div className={styles.socials}>
          <img src={images.facebook} alt="Facebook" />
          <img src={images.whatsapp} alt="WhatsApp" />
          <img src={images.youtube} alt="YouTube" />
          <img src={images.whatsapp} alt="WhatsApp Community" />
        </div>
      </div>

      {/* Product */}
      <div className={styles.section}>
        <p className={styles.heading}>Product</p>
        <p>Testimonials</p>
        <p>Comparison</p>
        <p>Alternatives</p>
        <p>Developer Hub</p>
      </div>

      {/* About */}
      <div className={styles.section}>
        <p className={styles.headingabout}>About Us</p>
        <p>Careers</p>
        <p>Brand Assets</p>
        <p>Partnerships</p>
      </div>

      {/* Resources */}
      <div className={styles.section}>
        <p className={styles.headingabout}>Resources</p>
        <p>Read Our Blog</p>
        <p>Help Center</p>
        <p>Security</p>
      </div>

      {/* Legal */}
      <div className={styles.section}>
        <p className={styles.headingabout}>Legal</p>
        <p>Terms of Use</p>
        <p>Privacy Policy</p>
      </div>
    </footer>
  );
};

export default Footer;
