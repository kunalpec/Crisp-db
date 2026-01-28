import { Company } from '../../models/Company.model.js';
import { ApiKey } from '../../models/ApiKey.model.js';

import AsyncHandler from '../../utils/AsyncHandler.util.js';
import ApiResponse from '../../utils/ApiResponse.util.js';
import ApiError from '../../utils/ApiError.util.js';
import HTTP_STATUS from '../../constants/httpStatusCodes.constant.js';
import {requireCompanyAdmin} from "./checkRole.controller.js";

// Get API Key (Company Admin only)
export const getApiKey = AsyncHandler(async (req, res) => {
  requireCompanyAdmin(req);

  const companyId = req.user.company_id;

  if (!companyId) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Company not linked to user'
    );
  }

  // Check company is active
  const company = await Company.findOne({
    _id: companyId,
    status: 'active',
  });

  if (!company) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      'Company is inactive or does not exist'
    );
  }

  const now = new Date();

  // ✅ Get valid API key
  const apiKey = await ApiKey.findOne({
    company_id: companyId,
    $or: [
      { expires_at: null },
      { expires_at: { $gt: now } },
    ],
  }).select('-api_key_hash');

  if (!apiKey) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'API key not found or expired'
    );
  }

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        id: apiKey._id,
        company_id: apiKey.company_id,
        start_at: apiKey.start_at,
        expires_at: apiKey.expires_at,
      },
      'API key fetched successfully'
    )
  );
});

