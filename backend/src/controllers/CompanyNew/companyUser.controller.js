import { CompanyUser } from "../../models/CompanyUser.model.js";
import { Company } from "../../models/Company.model.js";
import AsyncHandler from "../../utils/AsyncHandler.util.js";
import ApiError from "../../utils/ApiError.util.js";
import ApiResponse from "../../utils/ApiResponse.util.js";

/**
 * ======================================================
 * ✅ Generate Access & Refresh Tokens
 * ======================================================
 */
export const generateTokens = async (user) => {
  if (!user) throw new ApiError(500, "User required for token generation");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refresh_token = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

/**
 * ======================================================
 * ✅ Create Employee (Admin Only)
 * Route: POST /api/company/users
 * ======================================================
 */


/**
 * ======================================================
 * ✅ Get All Employees (Admin Only)
 * Route: GET /api/company/users
 * ======================================================
 */
export const getEmployees = AsyncHandler(async (req, res) => {
  const company_id = req.user.company_id;
  const users = await CompanyUser.find({ company_id }).select("-password -refresh_token");

  return res.status(200).json(new ApiResponse(200, users, "Employees fetched successfully"));
});

/**
 * ======================================================
 * ✅ Get Single Employee
 * Route: GET /api/company/users/:id
 * ======================================================
 */
export const getEmployee = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const company_id = req.user.company_id;

  const user = await CompanyUser.findOne({ _id: id, company_id }).select("-password -refresh_token");
  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, user, "Employee fetched successfully"));
});

/**
 * ======================================================
 * ✅ Update Employee (Admin Only)
 * Route: PATCH /api/company/users/:id
 * ======================================================
 */
export const updateEmployee = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const company_id = req.user.company_id;
  const updates = req.body;

  if (updates.role && !["company_admin", "company_agent"].includes(updates.role)) {
    throw new ApiError(400, "Invalid role");
  }

  const user = await CompanyUser.findOneAndUpdate({ _id: id, company_id }, updates, { new: true });
  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, user, "Employee updated successfully"));
});

/**
 * ======================================================
 * ✅ Delete Employee (Admin Only)
 * Route: DELETE /api/company/users/:id
 * ======================================================
 */
export const deleteEmployee = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const company_id = req.user.company_id;

  const user = await CompanyUser.findOneAndDelete({ _id: id, company_id });
  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, null, "Employee deleted successfully"));
});

/**
 * ======================================================
 * ✅ Employee / Admin Login
 * Route: POST /api/company/users/login
 * ======================================================
 */
export const loginEmployee = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password required");

  const user = await CompanyUser.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isValid = await user.isPasswordCorrect(password);
  if (!isValid) throw new ApiError(401, "Invalid credentials");

  const { accessToken, refreshToken } = await generateTokens(user);

  res.cookie("accessToken", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

  const safeUser = {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    company_id: user.company_id,
  };

  return res.status(200).json(new ApiResponse(200, { accessToken, user: safeUser }, "Login successful"));
});
