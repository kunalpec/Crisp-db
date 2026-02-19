import React, { useEffect, useState } from "react";
import axios from "axios";
import MainDashboard from "./MainDashboard";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/company/dashboard",
          { withCredentials: true }
        );

        setDashboardData(res.data.data);
      } catch (err) {
        console.log("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <h2>Loading...</h2>;
  if (!dashboardData) return <h2>Unauthorized</h2>;

  return <MainDashboard dashboardData={dashboardData} />;
};

export default Dashboard;
