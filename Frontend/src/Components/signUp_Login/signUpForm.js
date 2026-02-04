import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authActions } from "../../store/authSlice";
import styles from "./Signup.module.css";
import axios from "axios";
import images from "../../assets/images";

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
        "http://localhost:8000/api/v1/company/create-company",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Signup success:", res.data);

      alert("Company registered successfully!");
      navigate("/login");
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
        <h1 className={activeStyles.heroTitle}>Welcome to the Mediator</h1>

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
          <>
            {/* Company Name */}
            <div className={activeStyles.formGroup}>
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName || ""}
                onChange={handleChange}
                placeholder="Enter Company Name"
              />
            </div>

            {/* Company Domain */}
            <div className={activeStyles.formGroup}>
              <label>Company Domain</label>
              <input
                type="text"
                name="companyDomain"
                value={formData.companyDomain || ""}
                onChange={handleChange}
                placeholder="example.com"
              />
            </div>

            {/* Username */}
            <div className={activeStyles.formGroup}>
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
                placeholder="Enter Username"
              />
            </div>

            {/* Email */}
            <div className={activeStyles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                placeholder="Enter Email Address"
              />
            </div>

            {/* Phone */}
            <div className={activeStyles.phoneGroup}>
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

              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber || ""}
                onChange={handleChange}
                placeholder="Enter Contact Number"
                className={activeStyles.phoneInput}
              />
            </div>

            {/* Password row */}
            <div className={activeStyles.rowGroup}>
              <div className={activeStyles.formGroup}>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password || ""}
                  onChange={handleChange}
                  placeholder="Enter Password"
                />
              </div>

              <div className={activeStyles.formGroup}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword || ""}
                  onChange={handleChange}
                  placeholder="Re-enter Password"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={activeStyles.submitButton}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </>
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
