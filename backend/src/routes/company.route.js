import express from 'express';
import { createCompany } from '../controllers/Company/createCompany.controller.js';
import { inviteEmployeeFromSameCompany } from '../controllers/invite/inviteEmployee.controller.js';
import { acceptInviteAndSignup } from '../controllers/invite/acceptInvite.controller.js';
import { authenticate } from '../middlewares/Auth.middleware.js';
import { getActivePlans, getPlanById } from '../controllers/SuperAdmin/Plan.controller.js';
import { getApiKey } from '../controllers/Company/getApikey.controller.js';
import { updateCompanyPlan } from '../controllers/Company/updatePlan.controller.js';
// Create company router
const companyRouter = express.Router();

// Create a new company
companyRouter.post('/create-company', createCompany);

// Send invite to employee (protected route)
companyRouter.post('/send-invite', authenticate, inviteEmployeeFromSameCompany);

// Accept invite and sign up employee
companyRouter.post('/accept-invite', acceptInviteAndSignup);

// Get active plans (for users / signup)
companyRouter.get('/plans/active', authenticate,getActivePlans);

// Get plan by id (query param: ?id=)
companyRouter.get('/plans/by-id', getPlanById);

// Get All Company ApiKey
companyRouter.get('/api-key', authenticate, getApiKey);

// Update plans
companyRouter.post('/recharge-plans',authenticate,updateCompanyPlan);

export default companyRouter;
