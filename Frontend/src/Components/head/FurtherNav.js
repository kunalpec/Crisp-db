import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./FurtherNav.module.css";
import images from "../../assets/images";

const FurtherNav = ({ onClose }) => {
  const [isMiddleMenuOpen, setIsMiddleMenuOpen] = useState(false);
  const [isLockedOpen, setIsLockedOpen] = useState(false);
  const menuRef = useRef(null);

  /* Close sidebar on outside click */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleMouseEnter = () => {
    if (!isLockedOpen) setIsMiddleMenuOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isLockedOpen) setIsMiddleMenuOpen(false);
  };

  const toggleMiddleMenu = () => {
    setIsLockedOpen((prev) => !prev);
    setIsMiddleMenuOpen((prev) => !prev);
  };

  return (
    <div className={styles.overlay}>
      <aside className={styles.sidebar} ref={menuRef}>
        <div className={styles.wholeMenu}>
          {/* Left Menu */}
          <div
            className={styles.leftMenu}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <nav className={styles.mainMenu}>
              <ul className={styles.mainMenuUl}>
                <li className={styles.menu} onClick={toggleMiddleMenu}>
                  <span>Features</span>
                </li>

                <li className={styles.menu}>
                  <Link to="/app" className={styles.link}>App</Link>
                </li>

                <li className={styles.menu}>
                  <Link to="/pricing" className={styles.link}>Pricing</Link>
                </li>

                <li className={styles.menu}>
                  <Link to="/integration" className={styles.link}>Integration</Link>
                </li>

                <li className={styles.menu}>
                  <Link to="/help" className={styles.link}>Help</Link>
                </li>
              </ul>
            </nav>

            {/* Middle Menu */}
            {isMiddleMenuOpen && (
              <div className={styles.middleMenu}>
                <ul className={styles.middleMenuList}>
                  <li><Link to="/widget" className={styles.furtherNavItem}><i className="fas fa-video" /> Widget</Link></li>
                  <li><Link to="/chatbot" className={styles.furtherNavItem}><i className="fas fa-robot" /> AI Chatbot</Link></li>
                  <li><Link to="/crm" className={styles.furtherNavItem}><i className="fas fa-database" /> CRM</Link></li>
                  <li><Link to="/inbox" className={styles.furtherNavItem}><i className="fas fa-envelope" /> Shared Inbox</Link></li>
                  <li><Link to="/ai" className={styles.furtherNavItem}><i className="fas fa-globe" /> AI</Link></li>
                  <li><Link to="/knowledge" className={styles.furtherNavItem}><i className="fas fa-th-large" /> Knowledge</Link></li>
                  <li><Link to="/ticketing" className={styles.furtherNavItem}><i className="fas fa-ticket-alt" /> Ticketing</Link></li>
                  <li><Link to="/status" className={styles.furtherNavItem}><i className="fas fa-sync" /> Status Page</Link></li>
                  <li><Link to="/sdk" className={styles.furtherNavItem}><i className="fas fa-code" /> Chat SDK</Link></li>
                </ul>
              </div>
            )}
          </div>

          {/* Right Content */}
          <div className={styles.rightContent}>
            <div className={styles.headerImgContainer}>
              <img
                src={images.headerImg}
                alt="Industry"
                className={styles.bgImage}
              />
            </div>

            <div className={styles.contactDetails}>
              <div>
                <strong>Email</strong>
                <p>iqonic@gmail.com</p>
                <p>markino@gmail.com</p>
              </div>

              <div>
                <strong>Contact</strong>
                <p>(+264) 012321111</p>
                <p>(+255) 112447776</p>
              </div>

              <div>
                <strong>Social</strong>
                <div className={styles.socialIcons}>
                  <i className="fab fa-facebook-f" />
                  <i className="fab fa-x-twitter" />
                  <i className="fab fa-instagram" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close menu"
        >
          ✕
        </button>
      </aside>
    </div>
  );
};

export default FurtherNav;
