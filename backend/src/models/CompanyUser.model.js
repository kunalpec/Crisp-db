import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const companyUserSchema = new mongoose.Schema(
  {
    // Company reference (required for all company users)
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    // Basic Info
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

    // Store password securely (hashed automatically)
    password: {
      type: String,
      required: true,
      select: false,
    },

    // Phone Number (unique per company, not globally)
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

    // Role inside company
    role: {
      type: String,
      enum: ["company_admin", "company_agent"],
      default: "company_admin",
    },

    // Account Status
    is_active: {
      type: Boolean,
      default: true,
    },

    // Online Tracking (for realtime chat)
    is_online: {
      type: Boolean,
      default: false,
    },

    socket_id: {
      type: String,
      default: null,
    },

    // Refresh Token (hidden for security)
    refresh_token: {
      type: String,
      default: null,
      select: false,
    },

    // Forgot Password OTP System
    forgot_password_otp: {
      type: String,
      default: null,
      select: false,
    },

    forgot_password_otp_expiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

//
// ✅ INDEXES
//

// Email must be unique per company
companyUserSchema.index({ company_id: 1, email: 1 }, { unique: true });

// Phone number must be unique per company
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

export const CompanyUser = mongoose.model("CompanyUser", companyUserSchema);
