import SuperAdminLogin from "../pages/admin/SuperAdminLogin";
import SuperAdminDashboard from "../pages/admin/SuperAdminDashboard";
import AdminPrivateRoute from "../utils/AdminPrivateRoute";

export const adminRoutes = [
  { path: "/admin/login", element: <SuperAdminLogin /> },

  {
    path: "/admin/dashboard",
    element: (
      <AdminPrivateRoute>
        <SuperAdminDashboard/>
      </AdminPrivateRoute>
    ),
  },
];

