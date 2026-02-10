import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const companyUserSchema = new mongoose.Schema(
  {
    // ==============================
    // Company Reference
    // ==============================
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    // ==============================
    // Basic Info
    // ==============================
    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    // ==============================
    // Phone Number
    // ==============================
    phone_number: {
      country_code: {
        type: String,
        required: true,
      },
      number: {
        type: String,
        required: true,
      },
    },

    // ==============================
    // Role
    // ==============================
    role: {
      type: String,
      enum: ["company_admin", "company_agent"],
      default: "company_admin",
    },

    // ==============================
    // Account Status
    // ==============================
    is_active: {
      type: Boolean,
      default: true,
    },

    // ==============================
    // Realtime Tracking
    // ==============================
    is_online: {
      type: Boolean,
      default: false,
    },

    socket_id: {
      type: String,
      default: null,
    },

    // ==============================
    // Tokens
    // ==============================
    refresh_token: {
      type: String,
      default: null,
      select: false,
    },

    // ==============================
    // 🔐 Forgot Password OTP System
    // ==============================
    forgot_password_otp: {
      type: String,
      default: null,
      select: false,
    },

    forgot_password_otp_expiry: {
      type: Date,
      default: null,
    },

    is_otp_verified: {
      type: Boolean,
      default: false,
    },

    otp_attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

//
// ✅ INDEXES
//

// Email unique per company
companyUserSchema.index(
  { company_id: 1, email: 1 },
  { unique: true }
);

// Phone unique per company
companyUserSchema.index(
  { company_id: 1, "phone_number.number": 1 },
  { unique: true }
);

//
// ✅ PASSWORD HASHING
//
companyUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//
// ✅ PASSWORD VALIDATION
//
companyUserSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

//
// ✅ GENERATE ACCESS TOKEN
//
companyUserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      company_id: this.company_id,
      role: this.role,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    }
  );
};

//
// ✅ GENERATE REFRESH TOKEN
//
companyUserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    }
  );
};

//
// ✅ RESET OTP METHOD (Clean Reset Utility)
//
companyUserSchema.methods.resetOTPState = function () {
  this.forgot_password_otp = null;
  this.forgot_password_otp_expiry = null;
  this.is_otp_verified = false;
  this.otp_attempts = 0;
};

export const CompanyUser = mongoose.model(
  "CompanyUser",
  companyUserSchema
);
