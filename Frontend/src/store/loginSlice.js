import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  currentUser: null,
  error: {},
  isAuthenticated: false,

  emailForReset: "",
  otpForReset: "", // ✅ NEW
  otpVerified: false,
  forgotError: null,
  forgotSuccessMessage: null,
  step: "email",
};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.error = {};
    },

    loginFailure: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
    },

    setStep(state, action) {
      state.step = action.payload;
    },

    setResetEmail(state, action) {
      state.emailForReset = action.payload;
      state.forgotError = null;
      state.forgotSuccessMessage = "OTP sent successfully!";
    },

    // ✅ store OTP
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
      state.otpForReset = ""; // ✅ clear OTP
      state.otpVerified = false;
      state.forgotError = null;
      state.forgotSuccessMessage = null;
      state.step = "email";
    },

    updatePassword(state, action) {
      const { email, newPassword } = action.payload;
      const user = state.users.find(user => user.email === email);
      if (user) {
        user.password = newPassword;
      }
    },
  },
});

export const loginActions = loginSlice.actions;
export default loginSlice.reducer;
