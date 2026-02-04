import express from 'express';
import { login, forgetPassword, logout, verifyOtp, resetPassword ,refresh_accessToken } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/Auth.middleware.js';
// Create auth router
const authRouter = express.Router();

// User login route
authRouter.post('/login', login);

// User Logout
authRouter.post('/logout', authenticate, logout);

// forget password
authRouter.post('/forget-password', forgetPassword);

// Verify OTP
authRouter.post('/verify-otp', verifyOtp);

// Reset password
authRouter.post('/reset-password', resetPassword);

// Refresh AccessToken 
authRouter.post('/refresh-access-token',refresh_accessToken);

export default authRouter;
