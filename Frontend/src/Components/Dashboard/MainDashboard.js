import React, { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";

import DashboardNav from "./DashboardNav";
import DashboardChats from "./DashboardChats";
import DashboardMessageView from "./Dashboard_MessageView";

import styles from "./main-dashboard.module.css";

const MainDashboard = ({ dashboardData }) => {
  /* ==============================
      STATE
  ============================== */

  const [waitingVisitors, setWaitingVisitors] = useState([]);
  const [roomMessages, setRoomMessages] = useState({});
  const [activeRoom, setActiveRoom] = useState(null);
  const [activeVisitor, setActiveVisitor] = useState(null);
  const [visitorTyping, setVisitorTyping] = useState(false);
  const [employeeOnline, setEmployeeOnline] = useState(false);
  const [unreadRooms, setUnreadRooms] = useState({});

  const roomRef = useRef(null);

  /* ======================================================
      SOCKET INIT
  ====================================================== */

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleConnect = () => {
      setEmployeeOnline(true);
      socket.emit("employee:ready");

      if (roomRef.current) {
        socket.emit("employee:resume-room", {
          room_id: roomRef.current,
        });
      }
    };

    const handleDisconnect = () => {
      setEmployeeOnline(false);
    };

    const handleWaitingList = (list) => {
      setWaitingVisitors(list || []);
    };

    const refreshWaitingList = () => {
      socket.emit("employee:ready");
    };

    const handleChatHistory = (history) => {
      if (!roomRef.current) return;

      setRoomMessages((prev) => ({
        ...prev,
        [roomRef.current]: history || [],
      }));
    };

    const handleNewMessage = (msg) => {
      setRoomMessages((prev) => {
        const oldMsgs = prev[msg.room_id] || [];
        const exists = oldMsgs.some((m) => m.msg_id === msg.msg_id);
        if (exists) return prev;

        return {
          ...prev,
          [msg.room_id]: [...oldMsgs, msg],
        };
      });

      if (msg.room_id !== roomRef.current) {
        setUnreadRooms((prev) => ({
          ...prev,
          [msg.room_id]: (prev[msg.room_id] || 0) + 1,
        }));
      }
    };

    const handleVisitorTyping = ({ room_id }) => {
      if (room_id === roomRef.current) setVisitorTyping(true);
    };

    const handleVisitorStopTyping = ({ room_id }) => {
      if (room_id === roomRef.current) setVisitorTyping(false);
    };

    /* 🔥 VISITOR LEFT ALERT */
    const handleVisitorLeft = ({ room_id }) => {
      if (room_id === roomRef.current) {
        alert("Visitor has left the chat.");

        roomRef.current = null;
        setActiveRoom(null);
        setActiveVisitor(null);
        setVisitorTyping(false);

        socket.emit("employee:ready");
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    socket.on("employee:waiting-list", handleWaitingList);

    socket.on("employee:new-waiting-visitor", refreshWaitingList);
    socket.on("employee:visitor-left", refreshWaitingList);
    socket.on("employee:visitor-assigned", refreshWaitingList);

    socket.on("chat:history", handleChatHistory);
    socket.on("chat:new-message", handleNewMessage);

    socket.on("visitor:typing", handleVisitorTyping);
    socket.on("visitor:stop-typing", handleVisitorStopTyping);

    socket.on("visitor:left", handleVisitorLeft); // ✅ important

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);

      socket.off("employee:waiting-list", handleWaitingList);

      socket.off("employee:new-waiting-visitor", refreshWaitingList);
      socket.off("employee:visitor-left", refreshWaitingList);
      socket.off("employee:visitor-assigned", refreshWaitingList);

      socket.off("chat:history", handleChatHistory);
      socket.off("chat:new-message", handleNewMessage);

      socket.off("visitor:typing", handleVisitorTyping);
      socket.off("visitor:stop-typing", handleVisitorStopTyping);

      socket.off("visitor:left", handleVisitorLeft);
    };
  }, []);

  /* ======================================================
      SELECT VISITOR (JOIN PROTECTION ADDED)
  ====================================================== */

  const selectVisitor = (visitor) => {
    if (!visitor?.room_id) return;

    // 🔥 PROTECTION: Already inside another room
    if (roomRef.current && roomRef.current !== visitor.room_id) {
      alert("Please leave current room first.");
      return;
    }

    roomRef.current = visitor.room_id;

    setActiveRoom(visitor.room_id);
    setActiveVisitor(visitor.session_id);

    setUnreadRooms((prev) => ({
      ...prev,
      [visitor.room_id]: 0,
    }));

    socket.emit("employee:join-room", {
      room_id: visitor.room_id,
    });

    socket.emit("employee:load-history", {
      room_id: visitor.room_id,
    });
  };

  /* ======================================================
      SEND MESSAGE
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

    setRoomMessages((prev) => ({
      ...prev,
      [roomRef.current]: [...(prev[roomRef.current] || []), payload],
    }));

    socket.emit("employee:send-message", payload);
  };

  /* ======================================================
      LEAVE ROOM
  ====================================================== */

  const leaveRoom = () => {
    if (!roomRef.current) return;

    socket.emit("employee:leave-room", {
      room_id: roomRef.current,
    });

    roomRef.current = null;
    setActiveRoom(null);
    setActiveVisitor(null);
    setVisitorTyping(false);

    socket.emit("employee:ready");
  };

  const currentMessages = activeRoom
    ? roomMessages[activeRoom] || []
    : [];

  return (
    <div className={styles.mainDashboard}>
      <div className={styles.leftNav}>
        <DashboardNav dashboardData={dashboardData} />
      </div>

      <div className={styles.chatList}>
        <DashboardChats
          waitingVisitors={waitingVisitors}
          unreadRooms={unreadRooms}
          onSelectVisitor={selectVisitor}
        />
      </div>

      <div className={styles.chatPanel}>
        {activeRoom ? (
          <DashboardMessageView
            activeRoom={activeRoom}
            activeVisitor={activeVisitor}
            messages={currentMessages}
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