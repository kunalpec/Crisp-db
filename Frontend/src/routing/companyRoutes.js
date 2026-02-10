import LoginForm from "../Components/signUp_Login/LoginForm";
import SignUpForm from "../Components/signUp_Login/signUpForm";
import Dashboard from "../Components/Dashboard/Dashboard";
import ForgotPasswordForm from "../Components/signUp_Login/forgot/ForgotPasswordForm";
import ResetPassword from "../Components/signUp_Login/forgot/ResetPassword";
import CompanyPrivateRoute from "../utils/CompanyPrivateRoute";

export const companyRoutes = [
  { path: "/login", element: <LoginForm /> },
  { path: "/signup", element: <SignUpForm /> },
  { path: "/forgotpassword", element: <ForgotPasswordForm /> },
  { path: "/resetpassword", element: <ResetPassword /> },

  {
    path: "/dashboard",
    element: (
      <CompanyPrivateRoute>
        <Dashboard />
      </CompanyPrivateRoute>
    ),
  },
];
