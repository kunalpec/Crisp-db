import React, { useState,useEffect,useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authActions } from "../../store/authSlice";
import styles from "./signUpForm.module.css";
import style2 from './signUpStep2.module.css'
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
        const response = await axios.post("http://localhost:5000/api/auth/signup", formData);
        console.log("Registration Success:", response.data);
        navigate("/login");
      } catch (error) {
        console.error("Registration Error:", error);
      }
    } else {
      console.log("Form has errors", error);
    }
  };


    const activeStyles = step1Complete ? style2 : styles;

  return (
    <div className={activeStyles.form_main_div}>
      <div className={`${activeStyles.form_imgdiv} ${activeStyles.animatescene}`}>
        <img src={images.lightanimate} alt="Light" className={activeStyles.lighting} ref={lightRef} />
        <img src={images.boardanimate} alt="Board" className={activeStyles.board} ref={boardRef} />
        <img src={images.robotanimate} alt="Robot" className={activeStyles.robot} ref={robotRef} />
      </div>
 
        
     
      <div className={activeStyles.container}>
        <h2 className={activeStyles.signupHeading}>
          {step1Complete ? "Some details about your company" : "Open up your account now"}
        </h2>

        {!step1Complete && (
          <p className={activeStyles.subtext}>
            Already signed up? <a href="/login" className={activeStyles.loginLink}>Login</a>
          </p>
        )}

        <form className={activeStyles.form}>
          {!step1Complete && (
            <>
              <div className={activeStyles.formGroup}>
                <label htmlFor="forUse">For Use</label>
                <select id="forUse" name="forUse" onChange={handleSelectOption}>
                  <option value="company">For Company</option>
                  <option value="personal">For Personal Use</option>
                </select>
              </div>

              <div className={activeStyles.formGroup}>
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="Enter Your First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={error.firstName ? activeStyles.errorInput : ""}
                  required
                />
                {error.firstName && <p className={activeStyles.error}>{error.firstName}</p>}
              </div>

              <div className={activeStyles.formGroup}>
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Enter Your Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={error.lastName ? activeStyles.errorInput : ""}
                />
              </div>

              <div className={activeStyles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder={emailPlaceholder}
                  value={formData.email}
                  onChange={handleChange}
                  className={error.email ? activeStyles.errorInput : ""}
                  required
                />
                {error.email && <p className={activeStyles.error}>{error.email}</p>}
              </div>

              <div className={activeStyles.formGroup}>
                <label htmlFor="mobileNo">Contact Number</label>
                <input
                  type="tel"
                  id="mobileNo"
                  name="mobileNo"
                  placeholder="Enter Your Contact Number"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  className={error.mobileNo ? activeStyles.errorInput : ""}
                  required
                />
                {error.mobileNo && <p className={activeStyles.error}>{error.mobileNo}</p>}
              </div>

              <div className={activeStyles.formGroup}>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter Your Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={error.password ? activeStyles.errorInput : ""}
                  required
                />
                {error.password && <p className={activeStyles.error}>{error.password}</p>}
              </div>

              <div className={activeStyles.formGroup}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter Your Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={error.confirmPassword ? activeStyles.errorInput : ""}
                  required
                />
                {error.confirmPassword && <p className={activeStyles.error}>{error.confirmPassword}</p>}
              </div>

              <div className={activeStyles.formGroup}>
                <label htmlFor="address">Company Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  placeholder={addressPlaceholder}
                  value={formData.address}
                  onChange={handleChange}
                  className={error.address ? activeStyles.errorInput : ""}
                  required
                />
                {error.address && <p className={activeStyles.error}>{error.address}</p>}
              </div>

              <button type="button" onClick={handleStep1Submit} className={activeStyles.submitButton}>
                Register
              </button>
            </>
          )}

          {step1Complete && (
            <>
              <div className={activeStyles.formGroup}>
                <label htmlFor="companyName">Company Name</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  placeholder="Enter Your Company Name"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={error.companyName ? activeStyles.errorInput : ""}
                  required
                />
                {error.companyName && <p className={activeStyles.error}>{error.companyName}</p>}
              </div>

              <div className={activeStyles.formGroup}>
                <label htmlFor="website">Website Domain</label>
                <div className={activeStyles.inputWithButton}>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    placeholder="www.acme.com"
                    value={formData.website}
                    onChange={handleChange}
                    className={error.website ? activeStyles.errorInput : ""}
                    required
                  />
                  <button
                    type="button"
                    className={activeStyles.validateButton}
                    onClick={() => validateDomain(formData.website)}
                  >
                    Validate
                  </button>
                </div>
                {domainValidationError && <p className={activeStyles.error}>{domainValidationError}</p>}
                {error.website && <p className={activeStyles.error}>{error.website}</p>}
              </div>

              <div className={activeStyles.formGroup}>
                <label htmlFor="goal">Goal</label>
                <select
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  className={error.goal ? activeStyles.errorInput : ""}
                  required
                >
                  <option value="">-- Select your goal --</option>
                  {goalOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {error.goal && <p className={activeStyles.error}>{error.goal}</p>}
              </div>

              <button type="submit" onClick={handleStep2Submit} className={activeStyles.submitButton}>
                Discover My Dashboard
              </button>
            </>
          )}

          {isAuthenticated && <p className={activeStyles.success}>Successfully Signed Up!</p>}
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;