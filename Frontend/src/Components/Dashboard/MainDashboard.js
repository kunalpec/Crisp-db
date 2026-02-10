import React, { useState, useEffect } from "react";
import DashboardNav from "./DashboardNav";
import styles from "./main-dashboard.module.css";
import DashboardChats from "./DashboardChats";
import Dashboard_MessageView from "./Dashboard_MessageView";
import axios from "axios";
import { socket } from "../../socket";

const MainDashboard = ({ dashboardData }) => {

  // ===============================
  // STATES
  // ===============================
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);

  // ===============================
  // FETCH COMPANY CHAT ROOMS
  // ===============================
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/company/chatrooms",

          { withCredentials:true }
        );

        setChatRooms(res.data.data);
      } catch (err) {
        console.error("Room fetch error:", err);
      }
    };

    fetchRooms();
  }, []);

  // ===============================
  // LOAD ROOM MESSAGES
  // ===============================
  const loadMessages = async (roomId) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/company/chatrooms/${roomId}/messages`,
        { withCredentials: true }
      );

      setMessages(res.data.data);
      setSelectedRoom(roomId);
    } catch (err) {
      console.error("Message fetch error:", err);
    }
  };

  // ===============================
  // REALTIME MESSAGE LISTENER
  // ===============================
useEffect(() => {
  const handler = (data) => {
    if (data.roomId === selectedRoom) {
      setMessages((prev) => [...prev, data]);
    }
  };

  socket.on("message:received", handler);

  return () => {
    socket.off("message:received", handler);
  };
}, [selectedRoom]);


  // ===============================
  // SEND MESSAGE (SOCKET)
  // ===============================
  const handleSendMessage = (text) => {
    if (!selectedRoom) return;

    socket.emit("message:send", {
      roomId: selectedRoom,
      message: text,
    });
  };

  return (
    <div className={styles.mainDashboard}>
      <div className={styles.dashNav}>
        <DashboardNav dashboardData={dashboardData} />
      </div>

      <div className={styles.dashChat}>
        <DashboardChats
          rooms={chatRooms}
          onRoomClick={(room) => loadMessages(room.room_id)}
        />
      </div>

      <div className={styles.dashMsgView}>
        <Dashboard_MessageView
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default MainDashboard;
