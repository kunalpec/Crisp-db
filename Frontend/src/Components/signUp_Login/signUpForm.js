import React, { useState,useEffect,useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authActions } from "../../store/authSlice";
import styles from "./Signup.module.css";
import axios from "axios";
import images from "../../assets/images";

const goalOptions = [
  "Centralize my emails",
  "Build a chatbot",
  "Integrate messaging channels",
  "Chat with my website visitors",
  "I'm just curious"
];


const SignUpForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { step1Complete, isAuthenticated, error, ...formData } = useSelector((state) => state.auth);

  const [emailPlaceholder, setEmailPlaceholder] = useState("Enter Your Email");
  const [addressPlaceholder, setAddressPlaceholder] = useState("Enter Your Address");
  const [isDomainValidated, setIsDomainValidated] = useState(false);
  const [domainValidationError, setDomainValidationError] = useState("");



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


  const handleSelectOption = (event) => {
    setEmailPlaceholder(`Enter Your ${event.target.value} mail`);
    setAddressPlaceholder(`Enter Your ${event.target.value} address`);
  };

  const handleChange = (e) => {
    dispatch(authActions.signupUpdate({ name: e.target.name, value: e.target.value }));
    dispatch(authActions.signupValidate({ name: e.target.value }));

    // Reset domain validation if website input is changed
    if (e.target.name === "website") {
      setIsDomainValidated(false);
      setDomainValidationError("");
    }
  };

  async function validateDomain(domain) {
    try {
      const res = await fetch("/api/domain/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      const data = await res.json();

      if (data.success) {
        setIsDomainValidated(true);
        setDomainValidationError("");
        alert("Domain is valid!");
      } else {
        setIsDomainValidated(false);
        setDomainValidationError(data.message || "Domain validation failed");
      }
    } catch (err) {
      setIsDomainValidated(false);
      setDomainValidationError("Error validating domain. Try again.");
    }
  }

  const handleStep1Submit = (e) => {
    e.preventDefault();
    dispatch(authActions.signupValidate({ formType: "user" }));
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();

    if (!isDomainValidated) {
      setDomainValidationError("Please validate your website domain before submitting.");
      return;
    }

    dispatch(authActions.signupValidate({ formType: "company" }));

    if (Object.keys(error).length === 0) {
      try {
        const response = await axios.post("/api/v1/auth/signup", formData, { withCredentials: true });
        console.log("Registration Success:", response.data);
        navigate("/login");
      } catch (error) {
        console.error("Registration Error:", error);
      }
    } else {
      console.log("Form has errors", error);
    }
  };


const activeStyles = styles;

return (
  <div className={activeStyles.form_main_div}>

    {/* LEFT HERO */}
    <div className={activeStyles.leftHero}>
      <h1 className={activeStyles.heroTitle}>
        Welcome to the Mediator
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

      <form className={activeStyles.form}>
        {!step1Complete && (
          <>
            <div className={activeStyles.formGroup}>
              <label>For Use</label>
              <select
                className={activeStyles.groupfoam}
                name="forUse"
                onChange={handleSelectOption}
              >
                <option value="company">For Company</option>
                <option value="personal">For Personal Use</option>
              </select>
            </div>

            <div className={activeStyles.formGroup}>
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter Your First Name"
              />
            </div>

            <div className={activeStyles.formGroup}>
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter Your Last Name"
              />
            </div>

            <div className={activeStyles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={emailPlaceholder}
              />
            </div>

            <div className={activeStyles.formGroup}>
              <label>Contact Number</label>
              <input
                type="tel"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleChange}
                placeholder="Enter Your Contact Number"
              />
            </div>

            <div className={activeStyles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password"
              />
            </div>

            <div className={activeStyles.formGroup}>
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter Password"
              />
            </div>

            <div className={activeStyles.formGroup}>
              <label>Company Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder={addressPlaceholder}
              />
            </div>

            <button
              type="button"
              onClick={handleStep1Submit}
              className={activeStyles.submitButton}
            >
              Register
            </button>
          </>
        )}
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