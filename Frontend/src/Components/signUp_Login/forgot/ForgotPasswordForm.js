import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginActions } from "../../../store/loginSlice";
import styles from "./ForgotPasswordForm.module.css";
import axios from "axios";
import images from "../../../assets/images";

const API = "http://localhost:8000/api/v1/auth";

const ForgotPasswordForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { forgotError, forgotSuccessMessage, otpVerified, emailForReset, step } =
    useSelector((state) => state.login);

  const [formData, setFormData] = useState({
    email: emailForReset || "",
    otp: "",
  });

  const [message, setMessage] = useState("");

  // animation refs (unchanged UI)
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ SEND OTP
  const sendOtp = async () => {
    try {
      const res = await axios.post(
        `${API}/forget-password`,
        { recoveryEmail: formData.email },
        { withCredentials: true }
      );

      if (res.data?.message === "OTP sent to email") {
        dispatch(loginActions.setResetEmail(formData.email));
        dispatch(loginActions.setStep("otp"));
        setMessage("OTP sent to email");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid email");
    }
  };

  // ✅ VERIFY OTP
 const verifyOtp = async () => {
  try {
    const res = await axios.post(
      `${API}/verify-otp`,
      {
        email: formData.email.trim().toLowerCase(), // ✅ FIX
        otp: formData.otp.trim(), // ✅ FIX
      },
      { withCredentials: true }
    );

    if (res.data?.message === "OTP verified") {
      dispatch(loginActions.setOTP(formData.otp.trim())); // save OTP
      dispatch(loginActions.setOTPVerified(true));
    }
  } catch (err) {
    console.log("VERIFY ERROR:", err.response?.data);
    setMessage(err.response?.data?.message || "Invalid OTP");
  }
};


  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    if (step === "email") sendOtp();
    else verifyOtp();
  };

  // redirect after OTP success
  useEffect(() => {
    if (otpVerified) navigate("/resetpassword");
  }, [otpVerified, navigate]);

  return (
    <div className={styles.form_main_div}>
      {/* LEFT ANIMATION SIDE — untouched */}
      <div className={`${styles.form_imgdiv} ${styles.animatescene}`}>
        <img
          src={images.lightanimate}
          alt="Light"
          className={styles.lighting}
          ref={lightRef}
        />
        <img
          src={images.boardanimate}
          alt="Board"
          className={styles.board}
          ref={boardRef}
        />
        <img
          src={images.robotanimate}
          alt="Robot"
          className={styles.robot}
          ref={robotRef}
        />
      </div>

      {/* RIGHT FORM SIDE */}
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

          <button type="submit" className={styles.submitButton}>
            {step === "otp" ? "Validate OTP" : "Send OTP"}
          </button>

          {message && <p className={styles.message}>{message}</p>}
          {forgotError && <p className={styles.error}>{forgotError}</p>}
          {forgotSuccessMessage && (
            <p className={styles.success}>{forgotSuccessMessage}</p>
          )}

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
