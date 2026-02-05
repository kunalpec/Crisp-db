import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const superAdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ✅ Phone Number Object (Same as CompanyUser)
    phone_number: {
      country_code: {
        type: String,
        required: true,
      },
      number: {
        type: String,
        required: true,
        unique: true,
      },
    },

    password: {
      type: String,
      required: true,
      select: false, // Hide password by default
    },

    role: {
      type: String,
      default: "superadmin",
      enum: ["superadmin"], // Only one role here
    },

    refresh_token: {
      type: String,
      default: null,
      select: false,
    },
    forgot_password_otp: {
      type: String,
      default: null,
    },

    forgot_password_otp_expiry: {
      type: Date,
      default: null,
    },

  },
  { timestamps: true }
);

//
// ✅ Hash Password Before Save
//
superAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//
// ✅ Compare Password
//
superAdminSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

//
// ✅ Generate Access Token
//
superAdminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
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
// ✅ Generate Refresh Token
//
superAdminSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    }
  );
};

export const SuperAdmin = mongoose.model("SuperAdmin", superAdminSchema);
