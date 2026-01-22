import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import FurtherNav from "./FurtherNav";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <nav className={styles.navbar}>
        {/* Left Section */}
        <div className={styles.left}>
          <button
            className={styles.hamburger}
            onClick={() => setIsSidebarOpen(true)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Right Section */}
        <div className={styles.right}>
          <Link to="/signup" className={styles.headerBtn}>
            Sign Up
          </Link>

          <Link to="/login" className={styles.headerBtn}>
            Login
          </Link>
        </div>
      </nav>

      {isSidebarOpen && <FurtherNav onClose={() => setIsSidebarOpen(false)} />}
    </>
  );
};

export default Navbar;
