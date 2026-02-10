import jwt from "jsonwebtoken";
import { CompanyUser } from "../models/CompanyUser.model.js";
import { Company } from "../models/Company.model.js";
import ApiError from "../utils/ApiError.util.js";
import AsyncHandler from "../utils/AsyncHandler.util.js";
import HTTP_STATUS from "../constants/httpStatusCodes.constant.js";

export const authenticate = AsyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Access token missing"
    );
  }

  let decoded;

  try {
    decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
  } catch (error) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Invalid or expired token"
    );
  }

  const user = await CompanyUser.findById(decoded._id)
    .select("-password -refresh_token");

  if (!user) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "User not found"
    );
  }

  if (!user.is_active) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "User account inactive"
    );
  }

  const company = await Company.findById(user.company_id);

  if (!company || company.status !== "active") {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "Company inactive"
    );
  }

  req.user = user;

  next();
});
