import React, { useEffect, useState } from "react";
import axios from "axios";
import MainDashboard from "./MainDashboard";
import { socket } from "../../socket.js"; // ✅ ADD THIS

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==============================
  // FETCH DASHBOARD DATA
  // ==============================
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/company/dashboard",
          
          { withCredentials: true }
        );

        setDashboardData(res.data.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ==============================
  // SOCKET CONNECT AFTER AUTH
  // ==============================
  useEffect(() => {
    if (!dashboardData) return;

    // Connect only once
    socket.connect();

    console.log("🟢 Socket connecting...");

    socket.on("connect", () => {
      console.log("✅ Socket Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket Disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      console.log("Socket cleaned up");
    };
  }, [dashboardData]);

  // ==============================
  // UI STATES
  // ==============================
  if (loading) return <div>Loading...</div>;
  if (!dashboardData) return <div>Unauthorized</div>;

  return <MainDashboard dashboardData={dashboardData} />;
};

export default Dashboard;
