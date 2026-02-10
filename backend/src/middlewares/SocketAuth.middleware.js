import jwt from "jsonwebtoken";
import cookie from "cookie";
import { CompanyUser } from "../models/CompanyUser.model.js";
import { Company } from "../models/Company.model.js";

export const SocketAuth = async (socket, next) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;

    // No cookie → visitor
    if (!rawCookie) {
      socket.role = "visitor";
      return next();
    }

    const cookies = cookie.parse(rawCookie);
    const token = cookies.accessToken;

    // Cookie but no token → visitor
    if (!token) {
      socket.role = "visitor";
      return next();
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    // 🔐 Fetch user from DB (DO NOT trust token fully)
    const user = await CompanyUser.findById(decoded._id)
      .select("_id role company_id is_active");

    if (!user || !user.is_active) {
      return next(new Error("USER_INACTIVE"));
    }

    // 🔐 Check company status
    const company = await Company.findById(user.company_id)
      .select("status subscription_status subscription_expiry");

    if (!company || company.status !== "active") {
      return next(new Error("COMPANY_INACTIVE"));
    }

    if (
      company.subscription_expiry &&
      company.subscription_expiry < new Date()
    ) {
      return next(new Error("SUBSCRIPTION_EXPIRED"));
    }

    // Attach safe user object
    socket.user = {
      _id: user._id,
      role: user.role,
      company_id: user.company_id,
    };

    socket.role = user.role;

    return next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new Error("COOKIE_EXPIRED"));
    }

    return next(new Error("INVALID_TOKEN"));
  }
};
