import jwt from "jsonwebtoken";
import cookie from "cookie";
import { CompanyUser } from "../models/CompanyUser.model.js";
import { Company } from "../models/Company.model.js";

export const SocketAuth = async (socket, next) => {
  try {
    const rawCookie = socket.handshake.headers?.cookie;

    /* =====================================
       ✅ VISITOR (No Cookie)
    ===================================== */
    if (!rawCookie) {
      socket.role = "visitor";
      socket.user = null;
      return next();
    }

    const cookies = cookie.parse(rawCookie);
    const token = cookies.accessToken;

    /* =====================================
       ✅ VISITOR (No Token)
    ===================================== */
    if (!token) {
      socket.role = "visitor";
      socket.user = null;
      return next();
    }

    /* =====================================
       ✅ VERIFY EMPLOYEE TOKEN
    ===================================== */
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await CompanyUser.findById(decoded._id)
      .select("_id role company_id is_active email");

    if (!user || !user.is_active) {
      return next(new Error("USER_INACTIVE"));
    }

    const company = await Company.findById(user.company_id)
      .select("status subscription_status subscription_expiry");

    if (!company || company.status !== "active") {
      return next(new Error("COMPANY_INACTIVE"));
    }

    if (
      company.subscription_status !== "active" &&
      company.subscription_status !== "trial"
    ) {
      return next(new Error("SUBSCRIPTION_NOT_ACTIVE"));
    }

    if (
      company.subscription_expiry &&
      company.subscription_expiry < new Date()
    ) {
      return next(new Error("SUBSCRIPTION_EXPIRED"));
    }

    /* =====================================
       ✅ EMPLOYEE AUTH SUCCESS
    ===================================== */
    socket.user = {
      _id: user._id,
      role: user.role,
      company_id: user.company_id,
      email: user.email,
    };

    socket.role = "employee";

    return next();

  } catch (err) {
    /* =====================================
       ✅ TOKEN FAIL → VISITOR FALLBACK
    ===================================== */
    socket.role = "visitor";
    socket.user = null;
    return next();
  }
};
