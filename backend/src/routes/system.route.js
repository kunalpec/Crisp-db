import express from 'express';

import {
  createSuperAdmin,
  deleteSuperAdmin,
} from '../controllers/bootstrap/superAdmin.service.js';

import { createSuperCompany } from '../controllers/bootstrap/SuperCompany.service.js';
import { verifyBootstrapSecret } from '../middlewares/verifyBootstrapSecret.middleware.js';
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

// Create system router
const systemRouter = express.Router();

// Bootstrap routes (run once)

// Create system provider company
systemRouter.post(
  '/create-super-company',
  verifyBootstrapSecret,
  createSuperCompany
);

// Create super admin
systemRouter.post(
  '/create-super-admin',
  verifyBootstrapSecret,
  createSuperAdmin
);

// Delete super admin (dangerous)
systemRouter.delete(
  '/delete-super-admin',
  verifyBootstrapSecret,
  deleteSuperAdmin
);

// Plan management routes (Super Admin)

// Create new plan
systemRouter.post('/plans', authenticate, createPlan);

// Update existing plan
systemRouter.put('/plans/:planId', authenticate, updatePlan);

// Deactivate a plan
systemRouter.patch('/plans/:planId/deactivate', authenticate, deactivatePlan);

// Delete plan (only if not in use)
systemRouter.delete('/plans/:planId', authenticate, deletePlan);

// Get all active plans
systemRouter.get('/plans/active', authenticate, getActivePlans);

// Get plan by id (query param: ?id=)
systemRouter.get('/plans/by-id', getPlanById);

// Child company routes

// View all active companies
systemRouter.get('/view-all-companies', authenticate, getAllActiveCompanies);

export default systemRouter;
