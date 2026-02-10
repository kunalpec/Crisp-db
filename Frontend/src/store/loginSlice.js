import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // 🔹 Company Admin / Employee Auth
  currentUser: null,
  isAuthenticated: false,

  // 🔹 Super Admin Auth
  adminUser: null,
  adminAuthenticated: false,

  // 🔹 Global Errors
  error: null,

  // 🔹 Forgot Password State
  emailForReset: "",
  otpForReset: "",
  otpVerified: false,
  forgotError: null,
  forgotSuccessMessage: null,
  step: "email",
};

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {

    // ==============================
    // 🔐 COMPANY LOGIN
    // ==============================
    loginSuccess: (state, action) => {
      state.currentUser = {
        ...action.payload,
        role: action.payload.role,
      };
      state.isAuthenticated = true;
      state.error = null;
    },

    loginFailure: (state, action) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = action.payload || "Login failed";
    },

    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
    },

    // ==============================
    // 🔐 SUPER ADMIN LOGIN
    // ==============================
    adminLoginSuccess: (state, action) => {
      state.adminUser = {
        ...action.payload,
        role: action.payload.role,
      };
      state.adminAuthenticated = true;
      state.error = null;
    },

    adminLoginFailure: (state, action) => {
      state.adminUser = null;
      state.adminAuthenticated = false;
      state.error = action.payload || "Admin login failed";
    },

    adminLogout: (state) => {
      state.adminUser = null;
      state.adminAuthenticated = false;
    },

    // ==============================
    // 🔁 FORGOT PASSWORD FLOW
    // ==============================
    setStep(state, action) {
      state.step = action.payload;
    },

    setResetEmail(state, action) {
      state.emailForReset = action.payload;
      state.forgotError = null;
      state.forgotSuccessMessage = "OTP sent successfully!";
    },

    setOTP(state, action) {
      state.otpForReset = action.payload;
    },

    setOTPVerified(state, action) {
      state.otpVerified = action.payload;

      if (action.payload) {
        state.forgotSuccessMessage =
          "OTP verified successfully! You can now reset your password.";
      }
    },

    setForgotError(state, action) {
      state.forgotError = action.payload;
      state.forgotSuccessMessage = null;
    },

    setForgotSuccessMessage(state, action) {
      state.forgotSuccessMessage = action.payload;
      state.forgotError = null;
    },

    clearForgotPasswordState(state) {
      state.emailForReset = "";
      state.otpForReset = "";
      state.otpVerified = false;
      state.forgotError = null;
      state.forgotSuccessMessage = null;
      state.step = "email";
    },
  },
});

export const loginActions = loginSlice.actions;
export default loginSlice.reducer;
