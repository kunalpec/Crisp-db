import React, { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";

import DashboardNav from "./DashboardNav";
import DashboardChats from "./DashboardChats";
import DashboardMessageView from "./Dashboard_MessageView";

import styles from "./main-dashboard.module.css";

const MainDashboard = ({ dashboardData }) => {
  /* ==============================
      STATE MANAGEMENT
  ============================== */

  const [waitingVisitors, setWaitingVisitors] = useState([]);

  // ✅ Room-wise messages store
  const [roomMessages, setRoomMessages] = useState({});

  const [activeRoom, setActiveRoom] = useState(null);
  const [activeVisitor, setActiveVisitor] = useState(null);

  const [visitorTyping, setVisitorTyping] = useState(false);
  const [employeeOnline, setEmployeeOnline] = useState(false);

  const [unreadRooms, setUnreadRooms] = useState({});

  /* ==============================
      REFS
  ============================== */
  const roomRef = useRef(null);

  /* ======================================================
      ✅ SOCKET CONNECT + EVENTS
  ====================================================== */
  useEffect(() => {
    if (!socket.connected) socket.connect();

    /* ================= CONNECT ================= */
    const handleConnect = () => {
      console.log("✅ Connected:", socket.id);
      setEmployeeOnline(true);

      socket.emit("employee:ready");

      // Resume room if exists
      if (roomRef.current) {
        socket.emit("employee:resume-room", {
          room_id: roomRef.current,
        });
      }
    };

    /* ================= DISCONNECT ================= */
    const handleDisconnect = () => {
      console.log("❌ Disconnected");
      setEmployeeOnline(false);
    };

    /* ================= WAITING LIST ================= */
    const handleWaitingList = (list) => {
      setWaitingVisitors(list || []);
    };

    /* ================= NEW VISITOR ================= */
    const handleNewWaitingVisitor = (visitor) => {
      setWaitingVisitors((prev) => {
        const exists = prev.some((v) => v.room_id === visitor.room_id);
        return exists ? prev : [...prev, visitor];
      });
    };

    /* ================= CHAT HISTORY ================= */
    const handleChatHistory = (history) => {
      if (!roomRef.current) return;

      console.log("📌 Loaded History:", history);

      // ✅ Save history in correct room
      setRoomMessages((prev) => ({
        ...prev,
        [roomRef.current]: history || [],
      }));
    };

    /* ================= NEW MESSAGE ================= */
    const handleNewMessage = (msg) => {
      console.log("📩 New Message:", msg);

      // ✅ Add message to correct room
      setRoomMessages((prev) => {
        const oldMsgs = prev[msg.room_id] || [];

        // Prevent duplicates
        const exists = oldMsgs.some((m) => m.msg_id === msg.msg_id);
        if (exists) return prev;

        return {
          ...prev,
          [msg.room_id]: [...oldMsgs, msg],
        };
      });

      // If not active room → increase unread count
      if (msg.room_id !== roomRef.current) {
        setUnreadRooms((prev) => ({
          ...prev,
          [msg.room_id]: (prev[msg.room_id] || 0) + 1,
        }));
      }
    };

    /* ================= TYPING ================= */
    const handleVisitorTyping = ({ room_id }) => {
      if (room_id === roomRef.current) setVisitorTyping(true);
    };

    const handleVisitorStopTyping = ({ room_id }) => {
      if (room_id === roomRef.current) setVisitorTyping(false);
    };

    /* ================= EVENT BIND ================= */
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    socket.on("employee:waiting-list", handleWaitingList);
    socket.on("employee:new-waiting-visitor", handleNewWaitingVisitor);

    socket.on("chat:history", handleChatHistory);
    socket.on("chat:new-message", handleNewMessage);

    socket.on("visitor:typing", handleVisitorTyping);
    socket.on("visitor:stop-typing", handleVisitorStopTyping);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);

      socket.off("employee:waiting-list", handleWaitingList);
      socket.off("employee:new-waiting-visitor", handleNewWaitingVisitor);

      socket.off("chat:history", handleChatHistory);
      socket.off("chat:new-message", handleNewMessage);

      socket.off("visitor:typing", handleVisitorTyping);
      socket.off("visitor:stop-typing", handleVisitorStopTyping);
    };
  }, []);

  /* ======================================================
      ✅ SELECT VISITOR (JOIN ROOM)
  ====================================================== */
  const selectVisitor = (visitor) => {
    if (!visitor?.room_id) return;

    roomRef.current = visitor.room_id;

    setActiveRoom(visitor.room_id);
    setActiveVisitor(visitor.session_id);

    // Reset unread count
    setUnreadRooms((prev) => ({
      ...prev,
      [visitor.room_id]: 0,
    }));

    // Join room
    socket.emit("employee:join-room", {
      room_id: visitor.room_id,
    });

    // Load history
    socket.emit("employee:load-history", {
      room_id: visitor.room_id,
    });

    // Remove from waiting list
    setWaitingVisitors((prev) =>
      prev.filter((v) => v.room_id !== visitor.room_id)
    );
  };

  /* ======================================================
      ✅ SEND MESSAGE
  ====================================================== */
  const sendMessage = (text) => {
    if (!text.trim() || !roomRef.current) return;

    const payload = {
      msg_id: `${Date.now()}-${Math.random()}`,
      room_id: roomRef.current,
      msg_content: text,
      sender_type: "agent",
      send_at: new Date(),
    };

    // ✅ Optimistic add into correct room
    setRoomMessages((prev) => ({
      ...prev,
      [roomRef.current]: [...(prev[roomRef.current] || []), payload],
    }));

    socket.emit("employee:send-message", payload);
  };

  /* ======================================================
      ✅ LEAVE ROOM (SAFE)
  ====================================================== */
  const leaveRoom = () => {
    roomRef.current = null;
    setActiveRoom(null);
    setActiveVisitor(null);
    
    setVisitorTyping(false);

    // ❌ Messages delete nahi karne
    console.log("🚪 Employee left room (messages preserved)");
  };

  /* ======================================================
      ✅ CURRENT ROOM MESSAGES
  ====================================================== */
  const currentMessages = activeRoom
    ? roomMessages[activeRoom] || []
    : [];

  return (
    <div className={styles.mainDashboard}>
      {/* LEFT NAV */}
      <div className={styles.leftNav}>
        <DashboardNav dashboardData={dashboardData} />
      </div>

      {/* WAITING VISITORS */}
      <div className={styles.chatList}>
        <DashboardChats
          waitingVisitors={waitingVisitors}
          unreadRooms={unreadRooms}
          onSelectVisitor={selectVisitor}
        />
      </div>

      {/* CHAT PANEL */}
      <div className={styles.chatPanel}>
        {activeRoom ? (
          <DashboardMessageView
            activeRoom={activeRoom}
            activeVisitor={activeVisitor}
            messages={currentMessages} // ✅ Correct messages
            visitorTyping={visitorTyping}
            employeeOnline={employeeOnline}
            onSendMessage={sendMessage}
            onLeaveRoom={leaveRoom}
          />
        ) : (
          <div className={styles.emptyChat}>
            Select a visitor to start chatting 💬
          </div>
        )}
      </div>
    </div>
  );
};

export default MainDashboard;
