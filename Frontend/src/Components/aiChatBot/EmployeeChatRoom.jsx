import React, { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import "./EmployeeChatRoom.css";

/* ======================================================
   ✅ EMPLOYEE CHAT ROOM (110% PRODUCTION READY)
====================================================== */

const EmployeeChatRoom = () => {
  /* ==============================
      STATE MANAGEMENT
  ============================== */
  const [waitingVisitors, setWaitingVisitors] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [activeRoom, setActiveRoom] = useState(null);
  const [activeVisitor, setActiveVisitor] = useState(null);

  const [visitorTyping, setVisitorTyping] = useState(false);
  const [employeeOnline, setEmployeeOnline] = useState(false);

  const [unreadRooms, setUnreadRooms] = useState({}); // {room_id: count}

  /* ==============================
      REFS (NO RE-RENDER)
  ============================== */
  const roomRef = useRef(null);
  const typingTimeout = useRef(null);
  const lastTypingEmit = useRef(0);

  const messagesEndRef = useRef(null);

  /* ======================================================
      ✅ AUTO SCROLL TO LATEST MESSAGE
  ====================================================== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, visitorTyping]);

  /* ======================================================
      ✅ SOCKET CONNECT + ALL EVENTS
  ====================================================== */
  useEffect(() => {
    if (!socket.connected) socket.connect();

    /* ======================================================
        ✅ EMPLOYEE CONNECT
    ====================================================== */
    const handleConnect = () => {
      console.log("✅ Employee Connected:", socket.id);
      setEmployeeOnline(true);

      // Ask backend for waiting list
      socket.emit("employee:ready");

      // Resume room if reconnect happened
      if (roomRef.current) {
        socket.emit("employee:resume-room", {
          room_id: roomRef.current,
        });
      }
    };

    /* ======================================================
        ❌ EMPLOYEE DISCONNECT
    ====================================================== */
    const handleDisconnect = () => {
      console.log("❌ Employee Disconnected");
      setEmployeeOnline(false);
    };

    /* ======================================================
        ⚠ SOCKET ERROR HANDLING
    ====================================================== */
    const handleConnectError = (err) => {
      console.error("⚠ Socket Connection Error:", err.message);
    };

    /* ======================================================
        ✅ WAITING VISITOR LIST
    ====================================================== */
    const handleWaitingList = (list) => {
      console.log("📌 Waiting Visitors:", list);
      setWaitingVisitors(list || []);
    };

    /* ======================================================
        ✅ NEW VISITOR ENTERS QUEUE
    ====================================================== */
    const handleNewWaitingVisitor = (visitor) => {
      setWaitingVisitors((prev) => {
        const exists = prev.some((v) => v.room_id === visitor.room_id);
        if (exists) return prev;
        return [...prev, visitor];
      });
    };

    /* ======================================================
        ✅ AUTO ASSIGNED ROOM EVENT
    ====================================================== */
    const handleAssignedRoom = (payload) => {
      console.log("🎯 Assigned Room:", payload.room_id);

      selectVisitor(payload);
    };

    /* ======================================================
        ✅ LOAD CHAT HISTORY
    ====================================================== */
    const handleChatHistory = (history) => {
      console.log("📜 Chat History Loaded:", history.length);
      setMessages(history || []);
    };

    /* ======================================================
        ✅ RECEIVE NEW MESSAGE
    ====================================================== */
    const handleNewMessage = (msg) => {
      // If message belongs to active room
      if (msg.room_id === roomRef.current) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.msg_id === msg.msg_id);
          if (exists) return prev;
          return [...prev, msg];
        });
      } else {
        // Unread count for other rooms
        setUnreadRooms((prev) => ({
          ...prev,
          [msg.room_id]: (prev[msg.room_id] || 0) + 1,
        }));
      }
    };

    /* ======================================================
        ✍ VISITOR TYPING EVENTS
    ====================================================== */
    const handleVisitorTyping = (payload) => {
      if (payload.room_id === roomRef.current) setVisitorTyping(true);
    };

    const handleVisitorStopTyping = (payload) => {
      if (payload.room_id === roomRef.current) setVisitorTyping(false);
    };

    /* ======================================================
        🚪 VISITOR LEFT CHAT
    ====================================================== */
    const handleVisitorLeft = (payload) => {
      if (payload.room_id !== roomRef.current) return;

      alert("Visitor ended the chat.");
      leaveChat();
    };

    /* ======================================================
        🔌 VISITOR DISCONNECTED (NET ISSUE)
    ====================================================== */
    const handleVisitorDisconnected = (payload) => {
      if (payload.room_id !== roomRef.current) return;

      alert("Visitor disconnected. Waiting for reconnect...");
    };

    /* ======================================================
        SOCKET EVENT BINDINGS
    ====================================================== */
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    socket.on("employee:waiting-list", handleWaitingList);
    socket.on("employee:new-waiting-visitor", handleNewWaitingVisitor);

    socket.on("employee:assigned-room", handleAssignedRoom);

    socket.on("chat:history", handleChatHistory);
    socket.on("chat:new-message", handleNewMessage);

    socket.on("visitor:typing", handleVisitorTyping);
    socket.on("visitor:stop-typing", handleVisitorStopTyping);

    socket.on("visitor:left", handleVisitorLeft);
    socket.on("visitor:disconnected", handleVisitorDisconnected);

    /* ======================================================
        CLEANUP
    ====================================================== */
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);

      socket.off("employee:waiting-list", handleWaitingList);
      socket.off("employee:new-waiting-visitor", handleNewWaitingVisitor);

      socket.off("employee:assigned-room", handleAssignedRoom);

      socket.off("chat:history", handleChatHistory);
      socket.off("chat:new-message", handleNewMessage);

      socket.off("visitor:typing", handleVisitorTyping);
      socket.off("visitor:stop-typing", handleVisitorStopTyping);

      socket.off("visitor:left", handleVisitorLeft);
      socket.off("visitor:disconnected", handleVisitorDisconnected);
    };
  }, []);

  /* ======================================================
      ✅ SELECT VISITOR + JOIN ROOM
  ====================================================== */
  const selectVisitor = (visitor) => {
    if (!visitor?.room_id) return;

    console.log("✅ Joining Room:", visitor.room_id);

    roomRef.current = visitor.room_id;
    setActiveRoom(visitor.room_id);
    setActiveVisitor(visitor.session_id || "Visitor");

    setVisitorTyping(false);

    // Reset unread count
    setUnreadRooms((prev) => ({
      ...prev,
      [visitor.room_id]: 0,
    }));

    // Join backend room
    socket.emit("employee:join-room", {
      room_id: visitor.room_id,
    });

    // Load history
    socket.emit("employee:load-history", {
      room_id: visitor.room_id,
    });

    // Remove from waiting queue
    setWaitingVisitors((prev) =>
      prev.filter((v) => v.room_id !== visitor.room_id)
    );
  };

  /* ======================================================
      ✅ SEND MESSAGE WITH ACK SAFETY
  ====================================================== */
  const sendMessage = () => {
    if (!text.trim() || !roomRef.current) return;

    const payload = {
      msg_id: Date.now(),
      room_id: roomRef.current,
      msg_content: text.trim(),
      sender_type: "agent",
      send_at: new Date(),
    };

    // Optimistic UI
    setMessages((prev) => [...prev, payload]);
    setText("");

    // Emit with ACK
    socket.emit("employee:send-message", payload, (ack) => {
      if (!ack?.success) {
        alert("❌ Message failed to send.");
      }
    });
  };

  /* ======================================================
      ✍ EMPLOYEE TYPING EVENT
  ====================================================== */
  useEffect(() => {
    if (!roomRef.current) return;

    const now = Date.now();

    if (text.length > 0 && now - lastTypingEmit.current > 500) {
      socket.emit("employee:typing", { room_id: roomRef.current });
      lastTypingEmit.current = now;
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("employee:stop-typing", { room_id: roomRef.current });
    }, 800);

    return () => clearTimeout(typingTimeout.current);
  }, [text]);

  /* ======================================================
      🚪 LEAVE CHAT
  ====================================================== */
  const leaveChat = () => {
    if (!roomRef.current) return;

    socket.emit("employee:leave-room", {
      room_id: roomRef.current,
    });

    roomRef.current = null;
    setActiveRoom(null);
    setActiveVisitor(null);
    setMessages([]);
    setVisitorTyping(false);
  };

  /* ======================================================
      🛑 BROWSER CLOSE CLEANUP
  ====================================================== */
  useEffect(() => {
    const handleUnload = () => {
      socket.emit("employee:offline");
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  /* ======================================================
      ✅ UI RENDER
  ====================================================== */
  return (
    <div className="employee-wrapper">
      {/* Sidebar */}
      <div className="employee-sidebar">
        <h3>Waiting Visitors ({waitingVisitors.length})</h3>

        {waitingVisitors.length === 0 && <p>No waiting visitors</p>}

        {waitingVisitors.map((v) => (
          <div
            key={v.room_id}
            className="visitor-item"
            onClick={() => selectVisitor(v)}
          >
            Visitor: {v.session_id}

            {unreadRooms[v.room_id] > 0 && (
              <span className="badge">{unreadRooms[v.room_id]}</span>
            )}
          </div>
        ))}
      </div>

      {/* Chat Panel */}
      <div className="employee-chat">
        <h2>
          Employee Inbox{" "}
          <span className={employeeOnline ? "online" : "offline"}>
            {employeeOnline ? "Online" : "Offline"}
          </span>
        </h2>

        {!activeRoom && <p>Select visitor to start chat</p>}

        {activeRoom && (
          <div className="active-room">
            Chatting with <b>{activeVisitor}</b>
            <button onClick={leaveChat}>Leave</button>
          </div>
        )}

        {/* Messages */}
        <div className="messages">
          {messages.map((m) => (
            <div
              key={m.msg_id}
              className={m.sender_type === "agent" ? "agent-msg" : "visitor-msg"}
            >
              {m.msg_content}
            </div>
          ))}

          {visitorTyping && <div className="typing">Visitor typing...</div>}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="input-area">
          <input
            value={text}
            disabled={!activeRoom}
            placeholder="Type message..."
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button disabled={!activeRoom} onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeChatRoom;
