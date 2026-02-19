import React, { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import { createSession } from "./createSession";
import "./VisitorChatRoom.css";

/* ======================================================
   ✅ VISITOR CHAT ROOM (FIXED + PRODUCTION READY)
====================================================== */

const VisitorChatRoom = () => {
  /* ==============================
      STATE MANAGEMENT
  ============================== */
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  const [agentOnline, setAgentOnline] = useState(false);
  const [employeeTyping, setEmployeeTyping] = useState(false);

  const [connected, setConnected] = useState(false);
  const [roomReady, setRoomReady] = useState(false);

  /* ==============================
      REFS (NO RE-RENDER)
  ============================== */
  const sessionRef = useRef(null);
  const roomRef = useRef(null);

  const typingTimeout = useRef(null);
  const lastTypingEmit = useRef(0);

  const messagesEndRef = useRef(null);

  /* ======================================================
      ✅ AUTO SCROLL
  ====================================================== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, employeeTyping]);

  /* ======================================================
      ✅ INIT SESSION + ROOM PERSISTENCE
  ====================================================== */
  useEffect(() => {
    let savedSession = localStorage.getItem("visitor_session");
    let savedRoom = localStorage.getItem("visitor_room");
    let savedTime = localStorage.getItem("visitor_session_time");

    const now = Date.now();

    // ✅ Expiry limit (30 min)
    const SESSION_EXPIRY = 30 * 60 * 1000;

    if (savedTime && now - savedTime > SESSION_EXPIRY) {
      console.log("⏳ Session Expired → Creating Fresh Session");

      localStorage.removeItem("visitor_session");
      localStorage.removeItem("visitor_room");
      localStorage.removeItem("visitor_session_time");

      savedSession = null;
      savedRoom = null;
    }

    // ✅ Create new session if missing
    if (!savedSession) {
      savedSession = createSession();

      localStorage.setItem("visitor_session", savedSession);
      localStorage.setItem("visitor_session_time", now);
    }

    sessionRef.current = savedSession;

    // ✅ Restore room if exists
    if (savedRoom) {
      roomRef.current = savedRoom;
    }
  }, []);

  /* ======================================================
      ✅ SOCKET CONNECTION + EVENTS
  ====================================================== */
  useEffect(() => {
    if (!socket.connected) socket.connect();

    /* ======================================================
        ✅ CONNECT EVENT
    ====================================================== */
    const handleConnect = () => {
      console.log("✅ Visitor Connected:", socket.id);
      setConnected(true);

      // ✅ Resume if room already exists
      if (roomRef.current) {
        console.log("♻ Resuming Old Room:", roomRef.current);

        setRoomReady(true); // ✅ FIXED

        socket.emit("visitor:resume-room", {
          room_id: roomRef.current,
          session_id: sessionRef.current,
        });

        socket.emit("visitor:load-history", {
          room_id: roomRef.current,
        });

        return;
      }

      // ✅ First time room creation
      socket.emit(
        "visitor:create-new",
        {
          company_apikey:
            "ck_098a8cb8851120927a0d3a95fdd938a0be703302caf9ddf066c6694a78a4ea91",
          session_id: sessionRef.current,
        },
        (res) => {
          if (!res?.room_id) return;

          roomRef.current = res.room_id;
          localStorage.setItem("visitor_room", res.room_id);

          console.log("🎯 Room Created:", res.room_id);
          setRoomReady(true);

          socket.emit("visitor:load-history", {
            room_id: res.room_id,
          });
        }
      );
    };

    /* ======================================================
        ❌ DISCONNECT EVENT
    ====================================================== */
    const handleDisconnect = () => {
      console.log("❌ Visitor Disconnected");
      setConnected(false);
      setAgentOnline(false);
    };

    /* ======================================================
        ⚠ SOCKET ERROR EVENT
    ====================================================== */
    const handleConnectError = (err) => {
      console.error("⚠ Socket Error:", err.message);
    };

    /* ======================================================
        📜 CHAT HISTORY EVENT (FIXED)
    ====================================================== */
    const handleHistory = (history) => {
      console.log("📜 Chat History Loaded:", history);

      // ✅ Normalize messages so bubble text never blank
      const normalized = (history || []).map((m) => ({
        msg_id: m.msg_id || Date.now() + Math.random(),
        sender_type: m.sender_type,
        msg_content: m.msg_content || m.message || m.text || "",
      }));

      setMessages(normalized);
    };

    /* ======================================================
        ✅ RECEIVE MESSAGE (DEDUP SAFE)
    ====================================================== */
    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.msg_id === msg.msg_id);
        if (exists) return prev;

        return [
          ...prev,
          {
            ...msg,
            msg_content: msg.msg_content || msg.message || msg.text || "",
          },
        ];
      });
    };

    /* ======================================================
        ✅ AGENT JOIN / LEAVE EVENTS
    ====================================================== */
    const handleAgentJoined = () => {
      console.log("👨‍💻 Agent Joined Chat");
      setAgentOnline(true);
    };

    const handleAgentLeft = () => {
      console.log("🚪 Agent Left Chat");
      setAgentOnline(false);
    };

    /* ======================================================
        ✍ EMPLOYEE TYPING EVENTS
    ====================================================== */
    const handleEmployeeTyping = (payload) => {
      if (payload.room_id === roomRef.current) {
        setEmployeeTyping(true);
      }
    };

    const handleEmployeeStopTyping = (payload) => {
      if (payload.room_id === roomRef.current) {
        setEmployeeTyping(false);
      }
    };

    /* ======================================================
        ❌ CHAT CLOSED BY SYSTEM
    ====================================================== */
    const handleChatClosed = () => {
      alert("Chat session ended.");
      leaveChat();
    };

    /* ======================================================
        SOCKET BINDINGS
    ====================================================== */
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    socket.on("chat:history", handleHistory);
    socket.on("chat:new-message", handleNewMessage);

    socket.on("visitor:agent-joined", handleAgentJoined);
    socket.on("visitor:agent-left", handleAgentLeft);

    socket.on("employee:typing", handleEmployeeTyping);
    socket.on("employee:stop-typing", handleEmployeeStopTyping);

    socket.on("chat:closed", handleChatClosed);

    /* ======================================================
        CLEANUP
    ====================================================== */
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);

      socket.off("chat:history", handleHistory);
      socket.off("chat:new-message", handleNewMessage);

      socket.off("visitor:agent-joined", handleAgentJoined);
      socket.off("visitor:agent-left", handleAgentLeft);

      socket.off("employee:typing", handleEmployeeTyping);
      socket.off("employee:stop-typing", handleEmployeeStopTyping);

      socket.off("chat:closed", handleChatClosed);
    };
  }, []);

  /* ======================================================
      ✅ SEND MESSAGE (FIXED msg_id)
  ====================================================== */
  const sendMessage = () => {
    if (!text.trim() || !roomRef.current) return;

    const payload = {
      msg_id: Date.now() + Math.random(), // ✅ FIXED UNIQUE
      room_id: roomRef.current,
      session_id: sessionRef.current,
      msg_content: text.trim(),
      sender_type: "visitor",
      send_at: new Date(),
    };

    setMessages((prev) => [...prev, payload]);
    setText("");

    socket.emit("visitor:send-message", payload, (ack) => {
      if (!ack?.success) {
        alert("❌ Message delivery failed.");
      }
    });
  };

  /* ======================================================
      ✍ VISITOR TYPING EVENT (THROTTLED)
  ====================================================== */
  useEffect(() => {
    if (!roomRef.current) return;

    const now = Date.now();

    if (text.length > 0 && now - lastTypingEmit.current > 500) {
      socket.emit("visitor:typing", {
        room_id: roomRef.current,
        session_id: sessionRef.current,
      });
      lastTypingEmit.current = now;
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("visitor:stop-typing", {
        room_id: roomRef.current,
        session_id: sessionRef.current,
      });
    }, 800);

    return () => clearTimeout(typingTimeout.current);
  }, [text]);

  /* ======================================================
      🚪 LEAVE CHAT
  ====================================================== */
  const leaveChat = () => {
    if (!roomRef.current) return;

    socket.emit("visitor:leave-room", {
      room_id: roomRef.current,
    });

    roomRef.current = null;
    setRoomReady(false);

    setMessages([]);
    setAgentOnline(false);
    setEmployeeTyping(false);

    localStorage.removeItem("visitor_room");
  };

  /* ======================================================
      🛑 BROWSER CLOSE CLEANUP
  ====================================================== */
  useEffect(() => {
    const handleUnload = () => {
      socket.emit("visitor:offline", {
        room_id: roomRef.current,
      });
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  /* ======================================================
      ✅ UI
  ====================================================== */
  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <span>Live Support</span>

        <span className={agentOnline ? "status-online" : "status-offline"}>
          {connected
            ? agentOnline
              ? "Agent Online"
              : "Waiting for Agent..."
            : "Disconnected..."}
        </span>

        {roomReady && (
          <button className="leave-btn" onClick={leaveChat}>
            End Chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((m) => (
          <div
            key={m.msg_id}
            className={`message-row ${
              m.sender_type === "visitor" ? "visitor" : "agent"
            }`}
          >
            <div className="message-bubble">
              {m.msg_content} {/* ✅ FIXED */}
            </div>
          </div>
        ))}

        {employeeTyping && <div className="typing-text">Agent typing...</div>}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <input
          value={text}
          disabled={!roomReady}
          placeholder="Type message..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button disabled={!roomReady} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default VisitorChatRoom;
