import crypto from 'crypto';
import { Invite } from '../../models/Invite.model.js';
import { CompanyUser } from '../../models/CompanyUser.model.js';
import ApiResponse from '../../utils/ApiResponse.util.js';
import ApiError from '../../utils/ApiError.util.js';
import AsyncHandler from '../../utils/AsyncHandler.util.js';

/**
 * Invite Employee from the Same Company
 * Allowed roles: super_admin, company_admin
 */
export const inviteEmployeeFromSameCompany = AsyncHandler(async (req, res) => {
  const senderEmail=req.user.email;
  const { email, role } = req.body;

  // Validate request payload
  if (!email) {
    throw new ApiError(400, 'Employee email is required');
  }

  // Authorize inviter role
  if (!['super_admin', 'company_admin'].includes(req.user.role)) {
    throw new ApiError(403, 'You are not allowed to invite employees');
  }

  const companyId = req.user.company_id;

  // Prevent inviting an existing user
  const existingUser = await CompanyUser.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, 'User already exists with this email');
  }

  // Prevent duplicate active invites
  const existingInvite = await Invite.findOne({
    email,
    company_id: companyId,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (existingInvite) {
    throw new ApiError(400, 'Invite already sent to this email');
  }

  // Generate secure invite token
  const token = crypto.randomBytes(32).toString('hex');

  // Set invite expiration (48 hours)
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  // Create invite record
  await Invite.create({
    email,
    company_id: companyId,
    token,
    expiresAt,
    role: role,
  });

  // Generate frontend invite link
  const inviteLink = `${process.env.FRONTEND_URL}/api/v1/company/accept-invite?token=${token}`;

  return res.status(201).json(new ApiResponse(201, { inviteLink }, `Invite sent successfully by ${senderEmail}`));
});
