import jwt from 'jsonwebtoken';
import { CompanyUser } from '../models/CompanyUser.model.js';
import ApiError from '../utils/ApiError.util.js';
import AsyncHandler from '../utils/AsyncHandler.util.js';

export const authenticate = AsyncHandler(async (req, res, next) => {
  let token;

  // Get token from header OR cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  // Token missing
  if (!token) {
    throw new ApiError(401, 'Access token missing or invalid');
  }

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired access token');
  }

  // Get user from DB
  const user = await CompanyUser.findById(decoded._id).select('-password_hash -refresh_token');

  if (!user) {
    throw new ApiError(401, 'User not found');
  }

  // Attach user to request
  req.user = user;

  // Continue
  next();
});
