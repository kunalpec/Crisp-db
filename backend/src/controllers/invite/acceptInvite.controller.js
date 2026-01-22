import { Invite } from '../../models/Invite.model.js';
import { CompanyUser } from '../../models/CompanyUser.model.js';
import ApiResponse from '../../utils/ApiResponse.util.js';
import ApiError from '../../utils/ApiError.util.js';
import AsyncHandler from '../../utils/AsyncHandler.util.js';

/**
 * Accept Invite and Sign Up Employee
 */
export const acceptInviteAndSignup = AsyncHandler(async (req, res) => {
  const token=req.query.token;
  const {username, password , phone_number } = req.body;

  // Validate request payload
  if (!token || !username || !password || !phone_number) {
    throw new ApiError(400, 'Token, username, password and phone number are required');
  }

  // Retrieve valid invite
  const invite = await Invite.findOne({ token, used: false });

  if (!invite) {
    throw new ApiError(400, 'Invalid or expired invite');
  }

  // Check invite expiration
  if (invite.expiresAt < new Date()) {
    throw new ApiError(400, 'Invite has expired');
  }

  // Prevent duplicate user account
  const existingUser = await CompanyUser.findOne({ email: invite.email });

  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }

  // Create employee user
  const employee = await CompanyUser.create({
    company_id: invite.company_id,
    username,
    email: invite.email,
    password_hash: password, // Hashed via pre-save hook
    role: invite.role,
    phone_number
  });

  // Mark invite as used
  invite.used = true;
  await invite.save();

  // Send safe response
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        _id: employee._id,
        username: employee.username,
        email: employee.email,
        role: employee.role,
        phone_number : employee.phone_number
      },
      'Employee onboarded successfully'
    )
  );
});
