import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./SuperAdminLogin.module.css";
import { loginActions } from "../../store/loginSlice";
import { FaUser, FaLock } from "react-icons/fa";

const SuperAdminLogin = () => {
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setServerMessage("");
    setServerSuccess(null);

    try {
      setLoading(true);

      const payload = {
        email: formData.usernameOrEmail.trim().toLowerCase(),
        password: formData.password,
      };

      const res = await axios.post(
        "http://localhost:8000/api/superadmin/auth-superadmin/login",
        payload,
        { withCredentials: true }
      );

      const user = res.data.data;

      // 🔐 Role Safety Check
      if (user.role !== "SUPER_ADMIN") {
        setServerSuccess(false);
        setServerMessage("Unauthorized access");
        return;
      }

      // ✅ Use correct reducer
      dispatch(loginActions.adminLoginSuccess(user));

      setFormData({
        usernameOrEmail: "",
        password: "",
      });

      setServerSuccess(true);
      setServerMessage("Super Admin login successful!");

      navigate("/admin/dashboard");

    } catch (err) {
      setServerSuccess(false);
      setServerMessage(
        err.response?.data?.message || "Invalid email or password"
      );

      dispatch(loginActions.adminLoginFailure());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.form_main_div}>
      <div className={styles.sideContent}>
        <h1 className={styles.aiTitle}>
          Super Admin <span className={styles.highlight}>Portal</span>
        </h1>

        <p>
          Secure access to platform control panel.
          <br />
          Manage companies, plans, and system settings.
        </p>
      </div>

      <div className={styles.box}>
        <div className={styles.login}>
          <form className={styles.loginBx} onSubmit={handleLoginSubmit}>
            <h2>Super Admin Login</h2>

            <div className={styles.inputGroup}>
              <FaUser className={styles.inputIcon} />
              <input
                type="text"
                name="usernameOrEmail"
                placeholder="Email"
                value={formData.usernameOrEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <FaLock className={styles.inputIcon} />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {localError && <p className={styles.error}>{localError}</p>}

            <input
              type="submit"
              value={loading ? "Signing In..." : "Sign In"}
              disabled={loading}
            />

            <div className={styles.group}>
              <Link to="/admin/forgotpassword">Forgot Password</Link>
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

export default SuperAdminLogin;
