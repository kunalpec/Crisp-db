import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const CompanyPrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.login);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default CompanyPrivateRoute;
