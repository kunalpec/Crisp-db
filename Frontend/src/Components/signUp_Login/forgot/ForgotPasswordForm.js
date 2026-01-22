import React, { useState, useEffect,useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginActions } from "../../../store/loginSlice";
import styles from './ForgotPasswordForm.module.css';
import axios from "axios";
import images from '../../../assets/images'

const ForgotPasswordForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { forgotError, forgotSuccessMessage, otpVerified, emailForReset, step } = useSelector((state) => state.login);

  const [formData, setFormData] = useState({
    email: emailForReset || "",
    otp: "",
  });

  const [message, setMessage] = useState("");

  
  const boardRef = useRef(null);
  const lightRef = useRef(null);
  const robotRef = useRef(null);
  const overlayRef = useRef(null);
  
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
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Send OTP
  const sendOtp = async () => {
    const email = formData.email;
    try {
      const response = await axios.post("http://localhost:5000/api/otp/forgot-password", { email });

      const success = response?.data?.message === "OTP sent to email";

      if (success) {
        dispatch(loginActions.setStep("otp"));
        dispatch(loginActions.setResetEmail(email));
      } else {
        console.log("Backend response error:", response?.data);
        setMessage("Failed to send OTP. Try again.");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setMessage("Invalid email.");
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!formData.otp) {
      setMessage("OTP is required.");
      return;
    }

    

    try {
      const response = await axios.post("http://localhost:5000/api/otp/verify-otp", {
        email: formData.email,
        otp: String(formData.otp),
      });

      console.log("OTP Verification Response:", response);

      const success = response?.status === 200 && response?.data?.message === "OTP verified successfully";

      if (success) {
        dispatch(loginActions.setOTPVerified(true));
      } else {
        setMessage("Invalid OTP. Please check and try again.");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setMessage("Invalid OTP. Please try again.");
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === "email") {
      sendOtp();
    } else if (step === "otp") {
      verifyOtp();
    }
  };

  // Redirect to reset password if OTP verified
  useEffect(() => {
    if (otpVerified) {
      navigate('/resetpassword');
    }
  }, [otpVerified, navigate]);

  return (
    <div className={styles.form_main_div}>
       {/* Left Side image */}
   
<div className={`${styles.form_imgdiv} ${styles.animatescene}`}>
        {/* <div ref={overlayRef} className={styles.darkOverlay}></div> */}
        <img src={images.lightanimate} alt="Light" className={styles.lighting} ref={lightRef} />
        <img src={images.boardanimate} alt="Board" className={styles.board} ref={boardRef} />
        <img src={images.robotanimate} alt="Robot" className={styles.robot} ref={robotRef} />
      </div>

{/* right section forgot password form */}
      <div className={styles.container}>
        <h2 className={styles.forgotheading}>Forgot Password</h2>
        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.formGroup} >
            <label htmlFor="email">Registered Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={step === "otp"} // 🔥 Disable email field in OTP step
            />
          </div>

          {/* Only show OTP field if step is otp */}
          {step === "otp" && (
            <div className={styles.formGroup}>
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
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
          {forgotSuccessMessage && <p className={styles.success}>{forgotSuccessMessage}</p>}

          <p className={styles.forgotPassword}>
            <a href="/login" className={styles.a}>Back to Login</a>
          </p>

        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
