import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginActions } from "../../../store/loginSlice";
import styles from "./ForgotPasswordForm.module.css";
import axios from "axios";

const API = "http://localhost:8000/api/company/auth";

const ForgotPasswordForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { otpVerified, emailForReset, step } =
    useSelector((state) => state.login);

  const [formData, setFormData] = useState({
    email: emailForReset || "",
    otp: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ==============================
  // UI Animations (unchanged)
  // ==============================
  const boardRef = useRef(null);
  const lightRef = useRef(null);
  const robotRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (boardRef.current) boardRef.current.classList.add(styles.animateBoard);

    setTimeout(() => {
      if (lightRef.current) lightRef.current.classList.add(styles.animateLight);
    }, 3200);

    setTimeout(() => {
      if (robotRef.current) robotRef.current.classList.add(styles.animateRobot);
      if (overlayRef.current) overlayRef.current.classList.add(styles.dimmed);
    }, 4600);
  }, []);

  // ==============================
  // Handle Input Change
  // ==============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ==============================
  // SEND OTP
  // ==============================
  const sendOtp = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(
        `${API}/forgot-password`,
        { recoveryEmail: formData.email.trim().toLowerCase() }
      );

      setMessage(res.data?.message || "OTP sent successfully");

      dispatch(loginActions.setResetEmail(formData.email));
      dispatch(loginActions.setStep("otp"));
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // VERIFY OTP
  // ==============================
  const verifyOtp = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(
        `${API}/verify-otp`,
        {
          email: formData.email.trim().toLowerCase(),
          otp: formData.otp.trim(),
        }
      );

      setMessage(res.data?.message || "OTP verified");

      dispatch(loginActions.setOTP(formData.otp.trim()));
      dispatch(loginActions.setOTPVerified(true));
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // FORM SUBMIT
  // ==============================
  const handleSubmit = (e) => {
    e.preventDefault();

    if (loading) return;

    if (step === "email") {
      sendOtp();
    } else {
      verifyOtp();
    }
  };

  // ==============================
  // Redirect After OTP Verified
  // ==============================
  useEffect(() => {
    if (otpVerified) {
      navigate("/resetpassword");
    }
  }, [otpVerified, navigate]);

  return (
    <div className={styles.form_main_div}>
      <div className={styles.container}>
        <h2 className={styles.forgotheading}>Forgot Password</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Registered Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={step === "otp"}
            />
          </div>

          {step === "otp" && (
            <div className={styles.formGroup}>
              <label>Enter OTP</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter OTP"
                required
              />
            </div>
          )}

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading
              ? "Please wait..."
              : step === "otp"
              ? "Verify OTP"
              : "Send OTP"}
          </button>

          {message && <p className={styles.message}>{message}</p>}

          <p className={styles.forgotPassword}>
            <Link to="/login" className={styles.a}>
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
