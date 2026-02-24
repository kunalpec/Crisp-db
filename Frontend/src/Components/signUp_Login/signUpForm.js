import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authActions } from "../../store/authSlice";
import styles from "./Signup.module.css";
import axios from "axios";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaBuilding,
  FaGlobe,
} from "react-icons/fa";

const SignUpForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { step1Complete, isAuthenticated, error, ...formData } =
    useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);

  const boardRef = useRef(null);
  const lightRef = useRef(null);
  const robotRef = useRef(null);
  const overlayRef = useRef(null);

  // animations (unchanged)
  useEffect(() => {
    if (boardRef.current) {
      boardRef.current.classList.add(styles.animateBoard);
    }

    setTimeout(() => {
      if (lightRef.current) {
        lightRef.current.classList.add(styles.animateLight);
      }
    }, 3200);

    setTimeout(() => {
      if (robotRef.current) {
        robotRef.current.classList.add(styles.animateRobot);
      }
      if (overlayRef.current) {
        overlayRef.current.classList.add(styles.dimmed);
      }
    }, 4600);
  }, []);

  // input change
  const handleChange = (e) => {
    dispatch(
      authActions.signupUpdate({
        name: e.target.name,
        value: e.target.value,
      })
    );
  };

  // ==========================
  // SIGNUP SUBMIT (FIXED)
  // ==========================
  const handleSignup = async (e) => {
    e.preventDefault();

    if (loading) return;

    // client validation
    if (
      !formData.companyName ||
      !formData.companyDomain ||
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.contactNumber
    ) {
      alert("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        company_name: formData.companyName.trim(),
        company_domain: formData.companyDomain.trim().toLowerCase(),
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone_number: {
          country_code: formData.countryCode,
          number: formData.contactNumber,
        },
      };

      const res = await axios.post(
        "http://localhost:8000/api/company/auth/register",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Signup success:", res.data);

      alert("Company registered successfully!");
      navigate("/Plans");
    } catch (err) {
      console.error("Signup failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const activeStyles = styles;

  return (
    <div className={activeStyles.form_main_div}>
      {/* LEFT HERO */}
      <div className={activeStyles.leftHero}>
       <h1 className={styles.aiTitle}>
                 Welcome to <span className={styles.highlight}>AI Platform</span>
                 <span className={styles.typing}></span>
               </h1>

        <p className={activeStyles.heroText}>
          Build AI powered conversations, automate workflows,
          and connect with your customers like never before.
        </p>

        <div className={activeStyles.glowOrb}></div>
      </div>

      {/* SIGNUP CARD */}
      <div className={activeStyles.container}>
        <h1 className={activeStyles.signupTitle}>Sign Up</h1>

        <form className={activeStyles.form} onSubmit={handleSignup}>

          {/* Company Name */}
          <div className={activeStyles.formGroup}>
            <label>Company Name</label>
            <div className={activeStyles.inputWrapper}>
              <FaBuilding className={activeStyles.inputIcon} />
              <input
                type="text"
                name="companyName"
                value={formData.companyName || ""}
                onChange={handleChange}
                placeholder="Enter Company Name"
              />
            </div>
          </div>

          {/* Company Domain */}
          <div className={activeStyles.formGroup}>
            <label>Company Domain</label>
            <div className={activeStyles.inputWrapper}>
              <FaGlobe className={activeStyles.inputIcon} />
              <input
                type="text"
                name="companyDomain"
                value={formData.companyDomain || ""}
                onChange={handleChange}
                placeholder="example.com"
              />
            </div>
          </div>

          {/* Username */}
          <div className={activeStyles.formGroup}>
            <label>Username</label>
            <div className={activeStyles.inputWrapper}>
              <FaUser className={activeStyles.inputIcon} />
              <input
                type="text"
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
                placeholder="Enter Username"
              />
            </div>
          </div>

          {/* Email */}
          <div className={activeStyles.formGroup}>
            <label>Email</label>
            <div className={activeStyles.inputWrapper}>
              <FaEnvelope className={activeStyles.inputIcon} />
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                placeholder="Enter Email Address"
              />
            </div>
          </div>

          {/* Phone */}
          <div className={activeStyles.formGroup}>
            <label>Phone Number</label>
            <div className={activeStyles.phoneRow}>
              <select
                name="countryCode"
                value={formData.countryCode || "+91"}
                onChange={handleChange}
                className={activeStyles.countrySelect}
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+92">🇵🇰 +92</option>
              </select>

              <div className={activeStyles.inputWrapper}>
                <FaPhone className={activeStyles.inputIcon} />
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber || ""}
                  onChange={handleChange}
                  placeholder="Enter Contact Number"
                />
              </div>
            </div>
          </div>

          {/* Password Row */}
          <div className={activeStyles.rowGroup}>
            <div className={activeStyles.formGroup}>
              <label>Password</label>
              <div className={activeStyles.inputWrapper}>
                <FaLock className={activeStyles.inputIcon} />
                <input
                  type="password"
                  name="password"
                  value={formData.password || ""}
                  onChange={handleChange}
                  placeholder="Enter Password"
                />
              </div>
            </div>

            <div className={activeStyles.formGroup}>
              <label>Confirm Password</label>
              <div className={activeStyles.inputWrapper}>
                <FaLock className={activeStyles.inputIcon} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword || ""}
                  onChange={handleChange}
                  placeholder="Re-enter Password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={activeStyles.submitButton}
          >
            {loading ? "Registering..." : "Register"}
          </button>

        </form>


        <h2 className={activeStyles.signupHeading}>
          Create a new account now
        </h2>

        <p className={activeStyles.subtext}>
          Already signed up?{" "}
          <a href="/login" className={activeStyles.loginLink}>
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
