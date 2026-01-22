import express from 'express';
import { acceptInviteAndSignup } from '../controllers/invite/acceptInvite.controller.js';
import { authenticate } from '../middlewares/Auth.middleware.js';

// Create employee router
const employeeRouter = express.Router();

// Accept invite and sign up employee
employeeRouter.post('/accept-invite', acceptInviteAndSignup);

export default employeeRouter;
