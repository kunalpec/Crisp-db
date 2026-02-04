import crypto from 'crypto';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import { CompanyUser } from '../../models/CompanyUser.model.js';
import { Company } from '../../models/Company.model.js';
import { Plan } from '../../models/Plan.model.js';
import { ApiKey } from '../../models/ApiKey.model.js';

import AsyncHandler from '../../utils/AsyncHandler.util.js';
import ApiError from '../../utils/ApiError.util.js';
import ApiResponse from '../../utils/ApiResponse.util.js';

export const createCompany = AsyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let {
      company_name,
      company_domain,
      username,
      email,
      password,
      phone_number,
    } = req.body;

    // ========================
    // VALIDATION
    // ========================

    if (!company_name || !company_domain || !username || !email || !password || !phone_number) {
      throw new ApiError(400, 'All fields are required');
    }

    // normalize
    company_domain = company_domain.toLowerCase().trim();
    email = email.toLowerCase().trim();

    // ========================
    // PLAN VALIDATION
    // ========================

    const plan = await Plan.findOne({
      _id: '6982ee0cf96d47ea6b2e90d2',
      is_active: true,
    }).session(session);

    if (!plan) {
      throw new ApiError(400, 'Invalid or inactive plan');
    }

    // ========================
    // DUPLICATE CHECKS
    // ========================

    const existingCompany = await Company.findOne({ domain: company_domain }).session(session);
    if (existingCompany) {
      throw new ApiError(400, 'Company already exists with this domain');
    }

    const existingUser = await CompanyUser.findOne({ email }).session(session);
    if (existingUser) {
      throw new ApiError(400, 'User already exists with this email');
    }

    // ========================
    // CREATE COMPANY
    // ========================

    const company = await Company.create(
      [
        {
          name: company_name,
          domain: company_domain,
          is_system: false,
          status: 'active',
          owner_user_id: null,
          plan_id: plan._id,
        },
      ],
      { session }
    );

    const companyDoc = company[0];

    // ========================
    // CREATE ADMIN
    // ========================

    const admin = await CompanyUser.create(
      [
        {
          company_id: companyDoc._id,
          username,
          email,
          password_hash: password,
          role: 'company_admin',
          phone_number,
        },
      ],
      { session }
    );

    const adminDoc = admin[0];

    // assign owner
    companyDoc.owner_user_id = adminDoc._id;
    await companyDoc.save({ session });

    // ========================
    // API KEY CREATION
    // ========================

    const rawApiKey = crypto.randomBytes(32).toString('hex');

    const apiKeyHash = crypto
      .createHash('sha256')
      .update(rawApiKey)
      .digest('hex');

    const start_at = new Date();
    let expires_at = new Date(start_at);

    if (plan.billing_cycle === 'monthly') {
      expires_at.setMonth(expires_at.getMonth() + plan.duration);
    } else if (plan.billing_cycle === 'yearly') {
      expires_at.setFullYear(expires_at.getFullYear() + plan.duration);
    }

    await ApiKey.create(
      [
        {
          company_id: companyDoc._id,
          api_key_hash: apiKeyHash,
          start_at,
          expires_at,
        },
      ],
      { session }
    );

    // commit transaction
    await session.commitTransaction();
    session.endSession();

    // ========================
    // RESPONSE
    // ========================

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          company: {
            _id: companyDoc._id,
            name: companyDoc.name,
            domain: companyDoc.domain,
          },
          plan: {
            _id: plan._id,
            name: plan.name,
            description: plan.description,
            price: plan.price,
            billing_cycle: plan.billing_cycle,
            duration: plan.duration,
          },
          admin: {
            _id: adminDoc._id,
            username: adminDoc.username,
            email: adminDoc.email,
            role: adminDoc.role,
            phone_number: adminDoc.phone_number,
          },
          api_key: rawApiKey,
          api_key_expires_at: expires_at,
          note: 'Save this API key securely. It will not be shown again.',
        },
        'Company created successfully'
      )
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});
