import React, { useEffect, useState } from "react";
import axios from "axios";
import MainDashboard from "./MainDashboard";
import { socket } from "../../socket";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================
  // FETCH DASHBOARD DATA
  // ============================
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

  // ============================
  // SOCKET CONNECT ONCE
  // ============================
  useEffect(() => {
    if (!dashboardData) return;

    if (!socket.connected) {
      socket.connect();
      console.log("🟢 Socket Connecting...");
    }

    const onConnect = () =>
      console.log("✅ Socket Connected:", socket.id);

    const onDisconnect = () =>
      console.log("🔴 Socket Disconnected");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [dashboardData]);

  // ============================
  // UI STATES
  // ============================
  if (loading) return <div>Loading...</div>;
  if (!dashboardData) return <div>Unauthorized</div>;

  return <MainDashboard dashboardData={dashboardData} />;
};

export default Dashboard;
