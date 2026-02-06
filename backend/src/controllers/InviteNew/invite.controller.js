import crypto from "crypto";

import { Invite } from "../../models/Invite.model.js";
import { CompanyUser } from "../../models/CompanyUser.model.js";
import { Company } from "../../models/Company.model.js";

import ApiResponse from "../../utils/ApiResponse.util.js";
import ApiError from "../../utils/ApiError.util.js";
import AsyncHandler from "../../utils/AsyncHandler.util.js";

import { sendEmailApi } from "../../utils/emailService.util.js";

/**
 * ======================================================
 * ✅ INVITE EMPLOYEE (Admin → Employee Email Invite)
 * Route: POST /api/company/invite
 * Access: company_admin, super_admin
 * ======================================================
 */
export const inviteEmployee = AsyncHandler(async (req, res) => {
  const { email, role } = req.body;

  /* ---------------- VALIDATION ---------------- */
  if (!email) throw new ApiError(400, "Employee email is required");

  const allowedRoles = ["company_agent", "company_admin"];
  if (role && !allowedRoles.includes(role)) {
    throw new ApiError(400, "Invalid role selected");
  }

  if (!req.user.company_id) {
    throw new ApiError(400, "User is not linked with any company");
  }

  /* ---------------- ROLE AUTHORIZATION ---------------- */
  if (!["super_admin", "company_admin"].includes(req.user.role)) {
    throw new ApiError(403, "You are not allowed to invite employees");
  }

  /* ---------------- CHECK COMPANY ---------------- */
  const company = await Company.findById(req.user.company_id).select("name");

  if (!company) throw new ApiError(404, "Company not found");

  /* ---------------- CHECK USER EXISTS ---------------- */
  const existingUser = await CompanyUser.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw new ApiError(400, "User already exists with this email");
  }

  /* ---------------- CHECK ACTIVE INVITE ---------------- */
  const existingInvite = await Invite.findOne({
    email: email.toLowerCase(),
    company_id: req.user.company_id,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (existingInvite) {
    throw new ApiError(400, "Invite already sent and still active");
  }

  /* ---------------- CREATE TOKEN ---------------- */
  const token = crypto.randomBytes(40).toString("hex");

  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

  /* ---------------- SAVE INVITE ---------------- */
  await Invite.create({
    email: email.toLowerCase(),
    company_id: req.user.company_id,
    token,
    role: role || "company_agent",
    expiresAt,
  });

  /* ---------------- INVITE LINK (Frontend Page) ---------------- */
  const inviteLink = `${process.env.FRONTEND_URL}/accept-invite?token=${token}`;

  /* ---------------- SEND EMAIL ---------------- */
  await sendEmailApi({
    to: email,
    subject: `Invitation to join ${company.name}`,
    html: `
      <h2>You are invited to join ${company.name}</h2>
      <p>${req.user.email} invited you to join their company workspace.</p>

      <a href="${inviteLink}"
         style="display:inline-block;
                padding:12px 18px;
                background:#4f46e5;
                color:white;
                border-radius:8px;
                text-decoration:none;">
        Accept Invitation
      </a>

      <p>This invite will expire in <b>48 hours</b>.</p>
      <p>— ${company.name} Team</p>
    `,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      { inviteLink },
      "Invitation sent successfully"
    )
  );
});

/**
 * ======================================================
 * ✅ ACCEPT INVITE + EMPLOYEE SIGNUP
 * Route: POST /api/company/invite/accept?token=xxx
 * ======================================================
 */
export const acceptInvite = AsyncHandler(async (req, res) => {
  const token = req.query.token;
  const { username, password, phone_number } = req.body;

  /* ---------------- VALIDATION ---------------- */
  if (!token) throw new ApiError(400, "Invite token is required");

  if (!username || !password) {
    throw new ApiError(400, "Username and password are required");
  }

  if (!phone_number?.country_code || !phone_number?.number) {
    throw new ApiError(400, "Valid phone number is required");
  }

  /* ---------------- FIND INVITE ---------------- */
  const invite = await Invite.findOne({
    token,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!invite) {
    throw new ApiError(400, "Invalid or expired invite token");
  }

  /* ---------------- CHECK USER EXISTS ---------------- */
  const existingUser = await CompanyUser.findOne({
    email: invite.email,
  });

  if (existingUser) {
    throw new ApiError(400, "User already exists with this email");
  }

  /* ---------------- CREATE EMPLOYEE ---------------- */
  const employee = await CompanyUser.create({
    company_id: invite.company_id,
    username: username.trim(),
    email: invite.email,
    password, // ✅ correct (hashed in schema)
    phone_number,
    role: invite.role,
  });

  /* ---------------- MARK INVITE USED ---------------- */
  invite.used = true;
  await invite.save();

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        _id: employee._id,
        username: employee.username,
        email: employee.email,
        role: employee.role,
      },
      "Employee onboarded successfully"
    )
  );
});
