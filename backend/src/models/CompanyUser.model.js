import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const companyUserSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },

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

    password_hash: {
      type: String,
      required: true,
    },

    phone_number :{
      country_code : {
        required : true,
        type : String
      },
      number : {
        type : String , 
        required : true , 
        unique : true
      }
    },

    role: {
      type: String,
      enum: ['super_admin', 'company_admin', 'company_agent'],
      required: true,
    },

    is_online: {
      type: Boolean,
      default: false,
    },

    refresh_token: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Multi-tenant uniqueness
 * A user email must be unique per company
 */
companyUserSchema.index(
  { company_id: 1, email: 1 },
  { unique: true }
);

/**
 * Ensure only one super_admin per company
 */
companyUserSchema.index(
  { company_id: 1, role: 1 },
  {
    unique: true,
    partialFilterExpression: { role: 'super_admin' },
  }
);

/**
 * Hash password before saving
 */
companyUserSchema.pre('save', async function (next) {
  if (!this.isModified('password_hash')) {
    return next();
  }

  this.password_hash = await bcrypt.hash(this.password_hash, 10);
  next();
});

/**
 * Validate password
 */
companyUserSchema.methods.isPasswordCorrect = function (password) {
  return bcrypt.compare(password, this.password_hash);
};

/**
 * Generate access token
 */
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
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

/**
 * Generate refresh token
 */
companyUserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const CompanyUser = mongoose.model(
  'CompanyUser',
  companyUserSchema
);
