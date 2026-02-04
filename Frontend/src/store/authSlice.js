import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  companyName: "",
  companyDomain: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  contactNumber: "",
  countryCode: "+91",

  isAuthenticated: false,
  step1Complete: false,
  error: {},
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signupUpdate: (state, action) => {
      const { name, value } = action.payload;

      const safeValue = typeof value === "string" ? value : String(value || "");
      state[name] = safeValue;

      // clone errors
      const errors = { ...state.error };

      // required validation
      if (!safeValue.trim()) {
        errors[name] = `Enter ${name.replace(/([A-Z])/g, " $1")}`;
      } else {
        delete errors[name];
      }

      // password rule
      if (name === "password" && safeValue.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }

      // confirm password validation
      if (name === "confirmPassword" || name === "password") {
        if (state.confirmPassword !== state.password) {
          errors.confirmPassword = "Passwords do not match";
        } else {
          delete errors.confirmPassword;
        }
      }

      state.error = errors;
    },

    signupValidate: (state) => {
      const errors = {};

      if (!state.companyName) errors.companyName = "Enter Company Name";
      if (!state.companyDomain) errors.companyDomain = "Enter Company Domain";
      if (!state.username) errors.username = "Enter Username";
      if (!state.email) errors.email = "Enter Email";
      if (!state.password) errors.password = "Enter Password";
      if (!state.confirmPassword) errors.confirmPassword = "Confirm Password";
      if (state.password !== state.confirmPassword)
        errors.confirmPassword = "Passwords do not match";
      if (!state.contactNumber) errors.contactNumber = "Enter Contact Number";

      state.error = errors;

      if (Object.keys(errors).length === 0) {
        state.isAuthenticated = true;
      }
    },

    logout: () => initialState,
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
