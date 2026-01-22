import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  currentUser: null,
  error: {},
  isAuthenticated: false,

  // Forgot Password
  emailForReset: "",
  otpVerified: false,
  forgotError: null,
  forgotSuccessMessage: null,
  step: "email",
};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    signup: (state, action) => {
      const { email, password } = action.payload;
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      state.users.push({ email, username, password });
      state.error = {};
    },
    login: (state, action) => {
      const { usernameOrEmail, password } = action.payload;
      const foundUser = state.users.find(
        user =>
          (user.email === usernameOrEmail || user.username === usernameOrEmail) &&
          user.password === password
      );
      if (foundUser) {
        state.currentUser = foundUser;
        state.isAuthenticated = true;
        state.error = {};
      } else {
        state.isAuthenticated = false;
        state.currentUser = null;
        state.error = {
          usernameOrEmail: 'Invalid email or username',
          password: 'Incorrect password',
        };
      }
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
    setOTPVerified(state, action) {
      state.otpVerified = action.payload;
      if (action.payload) {
        state.forgotSuccessMessage = "OTP verified successfully! You can now reset your password.";
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
