import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AdminPrivateRoute = ({ children }) => {
  const { adminAuthenticated } = useSelector(state => state.login);

  if (!adminAuthenticated) {
    return <Navigate to="/admin/login" />;
  }

  return children;
};

export default AdminPrivateRoute;
