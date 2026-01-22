import express from 'express';
import { login } from '../controllers/auth.controller.js';

// Create auth router
const authRouter = express.Router();

// User login route
authRouter.post('/login', login);

export default authRouter;
