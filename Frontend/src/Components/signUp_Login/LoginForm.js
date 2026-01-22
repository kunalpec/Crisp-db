import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

import { loginActions } from "../../store/loginSlice";
import styles from "./LoginForm.module.css";
import images from "../../assets/images";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { error } = useSelector((state) => state.login);

  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const [localError, setLocalError] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const [serverSuccess, setServerSuccess] = useState(null);

  const boardRef = useRef(null);
  const lightRef = useRef(null);
  const robotRef = useRef(null);

  /* Animations */
  useEffect(() => {
    boardRef.current?.classList.add(styles.animateBoard);

    const lightTimer = setTimeout(() => {
      lightRef.current?.classList.add(styles.animateLight);
    }, 3200);

    const robotTimer = setTimeout(() => {
      robotRef.current?.classList.add(styles.animateRobot);
    }, 4600);

    return () => {
      clearTimeout(lightTimer);
      clearTimeout(robotTimer);
    };
  }, []);

  /* Input Change */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password" && value.length < 6) {
      setLocalError("Password must be at least 6 characters");
    } else {
      setLocalError("");
    }
  };

  /* Submit */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    setServerMessage("");
    setServerSuccess(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      dispatch(loginActions.loginSuccess(response.data.user));
      setServerSuccess(true);
      setServerMessage("Login successful!");

      navigate("/inbox");
    } catch (err) {
      setServerSuccess(false);

      if (err.response?.status === 401) {
        setServerMessage("Invalid username or password.");
      } else {
        setServerMessage("Something went wrong. Please try again.");
      }

      dispatch(loginActions.loginFailure());
    }
  };

  return (
    <div className={styles.form_main_div}>
      {/* Animation Scene */}
      <div className={`${styles.form_imgdiv} ${styles.animatescene}`}>
        <img
          src={images.lightanimate}
          alt="Light animation"
          className={styles.lighting}
          ref={lightRef}
        />
        <img
          src={images.boardanimate}
          alt="Board animation"
          className={styles.board}
          ref={boardRef}
        />
        <img
          src={images.robotanimate}
          alt="Robot animation"
          className={styles.robot}
          ref={robotRef}
        />
      </div>

      {/* Form */}
      <div className={styles.container}>
        <h2 className={styles.loginheading}>Login</h2>
        <p className={styles.subtext}>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className={styles.signupLink}>
            Sign Up
          </Link>
        </p>

        <form className={styles.form} onSubmit={handleLoginSubmit}>
          {/* Username */}
          <div className={styles.formGroup}>
            <label htmlFor="usernameOrEmail">Username or Email</label>
            <input
              type="text"
              id="usernameOrEmail"
              name="usernameOrEmail"
              placeholder="Enter your username or email"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {localError && <p className={styles.error}>{localError}</p>}
          </div>

          <button type="submit" className={styles.submitButton}>
            Login
          </button>

          <p className={styles.forgotPassword}>
            <Link to="/forgotpassword">Forgot Password?</Link>
          </p>

          {serverMessage && (
            <p className={serverSuccess ? styles.success : styles.error}>
              {serverMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
