import crypto from 'crypto';
import { Invite } from '../../models/Invite.model.js';
import { CompanyUser } from '../../models/CompanyUser.model.js';
import { Company } from '../../models/Company.model.js';
import ApiResponse from '../../utils/ApiResponse.util.js';
import ApiError from '../../utils/ApiError.util.js';
import AsyncHandler from '../../utils/AsyncHandler.util.js';
import { sendEmailApi } from '../../utils/emailService.util.js';

/**
 * Invite Employee from the Same Company
 * Allowed roles: super_admin, company_admin
 */
export const inviteEmployeeFromSameCompany = AsyncHandler(async (req, res) => {
  const senderEmail = req.user.email;
  const { email, role } = req.body;

  // Validate request payload
  if (!email) {
    throw new ApiError(400, 'Employee email is required');
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, 'Invalid email address');
  }

  // Prevent self-invite
  if (email === senderEmail) {
    throw new ApiError(400, 'You cannot invite yourself');
  }

  // Authorize inviter role
  if (!['super_admin', 'company_admin'].includes(req.user.role)) {
    throw new ApiError(403, 'You are not allowed to invite employees');
  }

  const companyId = req.user.company_id;
  if (!companyId) {
    throw new ApiError(400, 'Company not linked to user');
  }

  // FETCH COMPANY NAME
  const company = await Company.findById(companyId).select('name');
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }

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
    role,
  });

  // Generate frontend invite link
  const inviteLink = `${process.env.FRONTEND_URL}/api/v1/employee/accept-invite?token=${token}`;

  // SEND EMAIL WITH COMPANY NAME
  await sendEmailApi({
    from: `"${company.name} Team" from-<${senderEmail}>`,
    to: email,
    subject: `Invitation to join ${company.name}`,
    html: `
      <p>Hello,</p>

      <p>
        <strong>${senderEmail}</strong> has invited you to join
        <strong>${company.name}</strong>.
      </p>

      <p>
        Click the button below to accept the invitation:
      </p>

      <p>
        <a href="${inviteLink}"
           style="padding:10px 16px;
                  background:#4f46e5;
                  color:#fff;
                  text-decoration:none;
                  border-radius:6px;">
          Accept Invitation
        </a>
      </p>

      <p>This invitation is valid for <strong>48 hours</strong>.</p>

      <p>— ${company.name} Team</p>
    `,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { inviteLink }, `Invite sent successfully by ${senderEmail}`));
});
