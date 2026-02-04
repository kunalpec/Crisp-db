import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./LoginForm.module.css";
import { loginActions } from "../../store/loginSlice";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const [localError, setLocalError] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const [serverSuccess, setServerSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));

    if (name === "password" && value.length < 6)
      setLocalError("Password must be at least 6 characters");
    else setLocalError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setServerMessage("");
    setServerSuccess(null);

    try {
      setLoading(true);

      // ✅ Map UI field → backend format
      const payload = {
        email: formData.usernameOrEmail.trim().toLowerCase(),
        password: formData.password,
      };

      const res = await axios.post(
        "http://localhost:8000/api/v1/auth/login",
        payload,
        { withCredentials: true }
      );

      dispatch(loginActions.loginSuccess(res.data.data));

      setServerSuccess(true);
      setServerMessage("Login successful!");

      navigate("/inbox");
    } catch (err) {
      console.error(err);

      setServerSuccess(false);
      setServerMessage(
        err.response?.data?.message || "Invalid email or password"
      );

      dispatch(loginActions.loginFailure());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.form_main_div}>
      <div className={styles.particles}></div>

      <div className={styles.sideContent}>
        <h1 className={styles.aiTitle}>
          Welcome to <span>AI Platform</span>
        </h1>
        <p>
          Smart. Secure. Fast. <br />
          Experience next-generation AI powered communication.
        </p>
      </div>

      <div className={styles.box}>
        <div className={`${styles["glow-layer"]} ${styles["glow-pink"]}`}></div>
        <div className={`${styles["glow-layer"]} ${styles["glow-blue"]}`}></div>
        <div className={styles["box-inner"]}></div>

        <div className={styles.login}>
          <form className={styles.loginBx} onSubmit={handleLoginSubmit}>
            <h2>Login</h2>

            <input
              type="text"
              name="usernameOrEmail"
              placeholder="Username or Email"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {localError && <p className={styles.error}>{localError}</p>}

            <input
              type="submit"
              value={loading ? "Signing In..." : "Sign In"}
              disabled={loading}
            />

            <div className={styles.group}>
              <Link to="/forgotpassword">Forgot Password</Link>
              <Link to="/signup">Sign Up</Link>
            </div>

            {serverMessage && (
              <p className={serverSuccess ? styles.success : styles.error}>
                {serverMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
