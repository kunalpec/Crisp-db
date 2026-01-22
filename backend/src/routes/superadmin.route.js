import express from 'express';
import { authenticate } from '../middlewares/Auth.middleware.js';
import { getAllActiveCompanies } from '../controllers/SuperAdmin/ChildCompany.controller.js';
import {
  createPlan,
  updatePlan,
  deactivatePlan,
  deletePlan,
  getActivePlans,
  getPlanById,
} from '../controllers/SuperAdmin/Plan.controller.js';

// Create super admin router
const superadminRouter = express.Router();

// Plan management routes (Super Admin)

// Create new plan
superadminRouter.post('/plans', authenticate, createPlan);

// Update existing plan
superadminRouter.put('/plans/:planId', authenticate, updatePlan);

// Deactivate a plan
superadminRouter.patch('/plans/:planId/deactivate', authenticate, deactivatePlan);

// Delete plan (only if not in use)
superadminRouter.delete('/plans/:planId', authenticate, deletePlan);

// Get all active plans
superadminRouter.get('/plans/active', authenticate, getActivePlans);

// Get plan by id (query param: ?id=)
superadminRouter.get('/plans/by-id', getPlanById);

// Child company routes

// View all active companies
superadminRouter.get('/view-all-companies', authenticate, getAllActiveCompanies);

export default superadminRouter;
