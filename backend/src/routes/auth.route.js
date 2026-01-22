import express from 'express';
import { login,forgetPassword } from '../controllers/auth.controller.js';

// Create auth router
const authRouter = express.Router();

// User login route
authRouter.post('/login', login);

// forget password
authRouter.post('/forget-password',forgetPassword);

export default authRouter;
