import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import "./EmployeeChatRoom.css";

const EmployeeChatRoom = () => {

  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [visitorOnline, setVisitorOnline] = useState(false);
  const [visitorTyping, setVisitorTyping] = useState(false);
  const [visitorWaiting, setVisitorWaiting] = useState([]);
  const [visitorSelected, setVisitorSelected] = useState(null);

  const visitorRoomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /* =========================================
     HELPERS
  ========================================= */

  const formatTime = (date = new Date()) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;

  const unique_id = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  /* =========================================
     SOCKET LISTENERS
  ========================================= */

  useEffect(() => {

    if (!socket) return;

    /* 🔥 INITIAL WAITING LIST */
    socket.on("employee:waiting-list", (waitingChats) => {
      setVisitorWaiting(waitingChats || []);
    });

    /* 🔥 NEW WAITING VISITOR */
    socket.on("employee:new-waiting-visitor", (data) => {
      setVisitorWaiting((prev) => {
        const exists = prev.find(
          (v) => v.session_id === data.session_id
        );
        if (exists) return prev;
        return [...prev, data];
      });
    });

    /* 🔥 VISITOR ASSIGNED (remove from queue) */
    socket.on("employee:visitor-assigned", (data) => {
      setVisitorWaiting((prev) =>
        prev.filter((v) => v.session_id !== data.session_id)
      );
    });

    /* 🔥 ROOM ALREADY ASSIGNED */
    socket.on("employee:room-already-assigned", () => {
      alert("This chat was already taken by another agent.");
    });

    /* 🔥 VISITOR DISCONNECTED */
    socket.on("employee:visitor-disconnected", () => {
      setVisitorOnline(false);
    });

    /* 🔥 BACK TO QUEUE */
    socket.on("employee:chat-back-to-queue", (data) => {
      setVisitorWaiting((prev) => {
        const exists = prev.find(
          (v) => v.session_id === data.session_id
        );
        if (exists) return prev;
        return [...prev, data];
      });

      setVisitorOnline(false);
      setVisitorSelected(null);
      setMessages([]);
      visitorRoomRef.current = null;
    });

    /* 🔥 RECEIVE MESSAGE */
    socket.on("chat:new-message", (msg) => {

      if (msg.room_id !== visitorRoomRef.current) return;

      const formattedMsg = {
        msg_id: msg.msg_id,
        msg_content: msg.msg_content,
        msg_type:
          msg.sender_type === "agent" ? "employee" : "visitor",
        room_id: msg.room_id,
        send_at: formatTime(new Date(msg.send_at)),
      };

      setMessages((prev) => [...prev, formattedMsg]);
    });

    /* 🔥 VISITOR TYPING */
    socket.on("visitor:typing", () => setVisitorTyping(true));
    socket.on("visitor:stop-typing", () => setVisitorTyping(false));

    /* 🔥 VISITOR AGENT JOINED */
    socket.on("visitor:agent-joined", () => {
      setVisitorOnline(true);
    });

    return () => {
      socket.off("employee:waiting-list");
      socket.off("employee:new-waiting-visitor");
      socket.off("employee:visitor-assigned");
      socket.off("employee:room-already-assigned");
      socket.off("employee:visitor-disconnected");
      socket.off("employee:chat-back-to-queue");
      socket.off("chat:new-message");
      socket.off("visitor:typing");
      socket.off("visitor:stop-typing");
      socket.off("visitor:agent-joined");
    };

  }, []);

  /* =========================================
     SELECT VISITOR → ASSIGN CHAT
  ========================================= */

  const handleSelectVisitor = (visitor) => {

    visitorRoomRef.current = visitor.room_id;
    setVisitorSelected(visitor.session_id);
    setVisitorOnline(true);
    setMessages([]);

    socket.emit("employee:join-room", {
      room_id: visitor.room_id,
    });
  };

  /* =========================================
     LEAVE ROOM
  ========================================= */

  const handleLeaveRoom = () => {

    if (!visitorRoomRef.current) return;

    socket.emit("employee:leave-room", {
      room_id: visitorRoomRef.current,
    });

    setVisitorOnline(false);
    setVisitorSelected(null);
    setMessages([]);
    visitorRoomRef.current = null;
  };

  /* =========================================
     SEND MESSAGE
  ========================================= */

  const handleSubmitMessage = () => {

    const trimmed = text.trim();
    if (!trimmed || !visitorRoomRef.current) return;

    const msgInfo = {
      msg_id: unique_id(),
      msg_content: trimmed,
      msg_type: "employee",
      room_id: visitorRoomRef.current,
      send_at: formatTime(),
    };

    setMessages((prev) => [...prev, msgInfo]);

    socket.emit("employee:sending-message-to-visitor", msgInfo);

    setText("");
  };

  /* =========================================
     TYPING
  ========================================= */

  useEffect(() => {

    if (!visitorRoomRef.current) return;

    if (text.length > 0) {
      socket.emit("employee:me-typing", {
        room_id: visitorRoomRef.current,
      });
    }

    if (typingTimeoutRef.current)
      clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("employee:me-stoptyping", {
        room_id: visitorRoomRef.current,
      });
    }, 1000);

    return () => {
      if (typingTimeoutRef.current)
        clearTimeout(typingTimeoutRef.current);
    };

  }, [text]);

  /* =========================================
     UI
  ========================================= */

  return (
    <div className="employee-wrapper">

      <div className="employee-sidebar">
        <div className="employee-sidebar-header">
          Waiting Visitors ({visitorWaiting.length})
        </div>

        <div className="employee-visitor-list">

          {visitorWaiting.length === 0 && (
            <div style={{ padding: "12px", color: "#666" }}>
              No waiting visitors
            </div>
          )}

          {visitorWaiting.map((visitor) => (
            <div
              key={visitor.session_id}
              className={`employee-visitor-item ${
                visitorSelected === visitor.session_id ? "active" : ""
              }`}
              onClick={() => handleSelectVisitor(visitor)}
            >
              {visitor.session_id}
            </div>
          ))}

        </div>
      </div>

      <div className="employee-chat-container">

        <div className="employee-chat-header">
          <span>Employee Panel</span>

          <span
            className={
              visitorOnline
                ? "employee-status-online"
                : "employee-status-offline"
            }
          >
            {visitorOnline ? "Visitor Online" : "No Active Chat"}
          </span>

          {visitorSelected && (
            <button
              className="employee-leave-btn"
              onClick={handleLeaveRoom}
            >
              Leave Chat
            </button>
          )}
        </div>

        <div className="employee-chat-messages">

          {messages.length === 0 && (
            <div style={{ color: "#888", textAlign: "center" }}>
              No messages yet
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.msg_id}
              className={`employee-message-row ${msg.msg_type}`}
            >
              <div className={`employee-message-bubble ${msg.msg_type}`}>
                <div>{msg.msg_content}</div>
                <div className="employee-message-time">
                  {msg.send_at}
                </div>
              </div>
            </div>
          ))}

          {visitorTyping && (
            <div style={{ fontSize: "12px", color: "#666" }}>
              Visitor is typing...
            </div>
          )}

        </div>

        <div className="employee-chat-input-area">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your reply..."
            className="employee-chat-input"
            disabled={!visitorSelected}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmitMessage();
            }}
          />

          <button
            className="employee-send-btn"
            disabled={!visitorSelected}
            onClick={handleSubmitMessage}
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmployeeChatRoom;
