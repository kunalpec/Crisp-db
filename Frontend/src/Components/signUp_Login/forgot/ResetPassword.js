import React, { useState,useEffect,useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginActions } from '../../../store/loginSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import styles from './ResetPassword.module.css';
import images from '../../../assets/images';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ GET OTP ALSO
  const { emailForReset, otpForReset } = useSelector(state => state.login);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'newPassword') setNewPassword(value);
    else setConfirmPassword(value);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      dispatch(loginActions.setForgotError("Password must be at least 6 characters."));
      return;
    }

    if (newPassword !== confirmPassword) {
      dispatch(loginActions.setForgotError("Passwords do not match."));
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/company/auth/reset-password',
        {
         email: emailForReset.toLowerCase(),
          otp: otpForReset, // ✅ CRITICAL FIX
          newPassword,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        dispatch(loginActions.setForgotSuccessMessage("Password reset successfully!"));
        setResetSuccess(true);

        setTimeout(() => {
          dispatch(loginActions.clearForgotPasswordState());
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      dispatch(loginActions.setForgotError(
        error.response?.data?.message || "Failed to reset password"
      ));
    }
  };


  return (
    <div className={styles.form_main_div}>
             {/* Left Side image */}
   
    <div className={styles.container}>
    <h2 className={styles.resetheading}>Reset Password</h2>

      <form className={styles.form} onSubmit={handleResetPassword}>
       
        <div className={styles.formGroup}>
          <label htmlFor='reset-email'>Email</label>
          <input
            id='reset-email'
            type="email"
            name="email"
            value={emailForReset}
            disabled
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor='reset-password'>New Password</label>
          <input
            type="password"
            id="reset-password"
            name="newPassword" 
            placeholder="Enter new password"
            value={newPassword}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor='reset-confirm'>Re-enter New Password</label>
          <input
            type="password"
            id="reset-confirm"
            name="confirmPassword" 
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={handleInputChange}
            required
          />
        </div>

        <button className={styles.submitButton} type="submit">Reset Password</button>

        {resetSuccess && (
          <div className={styles.successMessage}>
            <p>Password reset successfully!</p>
            <p>
              <a href="/">Click here</a>
            </p>
          </div>
        )}
      </form>
    </div>
    </div>
  );
};

export default ResetPassword;
