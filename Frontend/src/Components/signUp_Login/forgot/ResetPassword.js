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
  const { emailForReset } = useSelector(state => state.login);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'newPassword') {
      setNewPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    console.log(newPassword)

    if (newPassword.length < 6) {
      dispatch(loginActions.setForgotError("Password must be at least 6 characters."));
      return;
    }
    if (newPassword !== confirmPassword) {
      dispatch(loginActions.setForgotError("Passwords do not match."));
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/otp/reset-password',
        {
          email: emailForReset,
          newPassword: String(newPassword),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log("Password Reset Response:", response);

      if (response.status === 200) {
      
        dispatch(loginActions.updatePassword({ email: emailForReset, newPassword }));

        dispatch(loginActions.setForgotSuccessMessage("Password reset successfully!"));
        setResetSuccess(true);

        setTimeout(() => {
          dispatch(loginActions.clearForgotPasswordState());
          navigate('/login');  
        }, 2000);
      } else {
        dispatch(loginActions.setForgotError(response.data.message || "Something went wrong. Please try again."));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to reset password. Please try again later.";
      dispatch(loginActions.setForgotError(errorMessage));
    }
  };

  return (
    <div className={styles.form_main_div}>
             {/* Left Side image */}
   

             <div className={`${styles.form_imgdiv} ${styles.animatescene}`}>
        {/* <div ref={overlayRef} className={styles.darkOverlay}></div> */}
        <img src={images.lightanimate} alt="Light" className={styles.lighting} ref={lightRef} />
        <img src={images.boardanimate} alt="Board" className={styles.board} ref={boardRef} />
        <img src={images.robotanimate} alt="Robot" className={styles.robot} ref={robotRef} />
      </div>

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
              <a href="/login">Click here to login</a>
            </p>
          </div>
        )}
      </form>
    </div>
    </div>
  );
};

export default ResetPassword;
