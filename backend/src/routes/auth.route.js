import express from 'express';
import { login, forgetPassword, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/Auth.middleware.js';
// Create auth router
const authRouter = express.Router();

// User login route
authRouter.post('/login', login);

// User Logout
authRouter.post('/logout', authenticate, logout);

// forget password
authRouter.post('/forget-password', forgetPassword);

export default authRouter;
