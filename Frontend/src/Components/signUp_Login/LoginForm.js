import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./LoginForm.module.css";
import { loginActions } from "../../store/loginSlice";
const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ usernameOrEmail: "", password: "" });
  const [localError, setLocalError] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const [serverSuccess, setServerSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));

    if (name === "password" && value.length < 6) setLocalError("Password must be at least 6 characters");
    else setLocalError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setServerMessage("");
    setServerSuccess(null);

    try {
      const res = await axios.post("/api/v1/auth/login", formData, { withCredentials: true });
      dispatch(loginActions.loginSuccess(res.data.user));
      setServerSuccess(true);
      setServerMessage("Login successful!");
      navigate("/inbox");
    } catch (err) {
      setServerSuccess(false);
      setServerMessage(err.response?.status === 401 ? "Invalid username or password" : "Something went wrong");
      dispatch(loginActions.loginFailure());
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
    {/* Glowing layers */}
    <div className={`${styles["glow-layer"]} ${styles["glow-pink"]}`}></div>
    <div className={`${styles["glow-layer"]} ${styles["glow-blue"]}`}></div>
    {/* Inner dark box */}
    <div className={styles["box-inner"]}></div>
     
    {/* Login Form */}
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
        <input type="submit" value="Sign In" />
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
