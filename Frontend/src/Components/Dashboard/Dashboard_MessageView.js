import React, { useEffect, useRef, useState } from "react";
import styles from "./dashboardMessageView.module.css";
import { socket } from "../../socket";

const DashboardMessageView = ({
  activeRoom,
  activeVisitor,
  messages,
  visitorTyping,
  employeeOnline,
  onSendMessage,
  onLeaveRoom, // ✅ Leave callback from MainDashboard
}) => {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  /* ==============================
      EMPLOYEE TYPING REFS
  ============================== */
  const typingTimeout = useRef(null);
  const lastTypingEmit = useRef(0);

  /* ==============================
      AUTO SCROLL
  ============================== */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, visitorTyping]);

  /* ======================================================
      ✅ EMPLOYEE TYPING EMIT SYSTEM
  ====================================================== */
  useEffect(() => {
    if (!socket.connected) return;
    if (!activeRoom) return;

    const now = Date.now();

    // ✅ Emit typing max every 500ms
    if (text.length > 0 && now - lastTypingEmit.current > 500) {
      socket.emit("employee:typing", {
        room_id: activeRoom,
      });

      lastTypingEmit.current = now;
    }

    // Clear old timeout
    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    // ✅ Stop typing after 800ms idle
    typingTimeout.current = setTimeout(() => {
      socket.emit("employee:stop-typing", {
        room_id: activeRoom,
      });
    }, 800);

    return () => clearTimeout(typingTimeout.current);
  }, [text, activeRoom]);

  /* ==============================
      ✅ SEND MESSAGE
  ============================== */
  const handleSend = () => {
    if (!text.trim()) return;

    onSendMessage(text.trim());

    // ✅ Stop typing immediately after send
    socket.emit("employee:stop-typing", {
      room_id: activeRoom,
    });

    setText("");
  };

  /* ==============================
      ✅ LEAVE CHAT FUNCTION
  ============================== */
  const handleLeaveChat = () => {
    if (!activeRoom) return;

    // Emit leave room event
    socket.emit("employee:leave-room", {
      room_id: activeRoom,
    });

    // Reset from parent dashboard
    if (onLeaveRoom) onLeaveRoom();
  };

  /* ==============================
      TIME FORMAT
  ============================== */
  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.chatPanel}>
      {/* ================= HEADER ================= */}
      <div className={styles.header}>
        <div>
          <h2>
            Employee Inbox{" "}
            <span className={employeeOnline ? styles.online : styles.offline}>
              {employeeOnline ? "Online" : "Offline"}
            </span>
          </h2>

          {activeRoom && (
            <p>
              Chatting with <b>{activeVisitor}</b>
            </p>
          )}
        </div>

        {/* ✅ LEAVE BUTTON */}
        {activeRoom && (
          <button className={styles.leaveBtn} onClick={handleLeaveChat}>
            Leave ✖
          </button>
        )}
      </div>

      {/* ================= EMPTY ================= */}
      {!activeRoom && (
        <div className={styles.noRoom}>
          Select a visitor to start chatting
        </div>
      )}

      {/* ================= CHAT AREA ================= */}
      {activeRoom && (
        <>

      
          {/* ================= MESSAGES ================= */}
          <div className={styles.messages}>
            {messages
              .filter((m) => (m.msg_content || m.content)?.trim())
              .map((m) => (
                <div
                  key={m.msg_id}
                  className={
                    m.sender_type === "agent"
                      ? styles.agentWrapper
                      : styles.visitorWrapper
                  }
                >
                  <div
                    className={
                      m.sender_type === "agent"
                        ? styles.agentMsg
                        : styles.visitorMsg
                    }
                  >
                    {m.msg_content || m.content}

                    <span className={styles.time}>
                      {formatTime(m.send_at)}
                    </span>
                  </div>
                </div>
              ))}

            {visitorTyping && (
              <div className={styles.typing}>Visitor is typing...</div>
            )}

            <div ref={bottomRef} />
          </div>


          {/* ================= INPUT ================= */}
          <div className={styles.inputArea}>
            <input
              value={text}
              placeholder="Reply..."
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />

            <button onClick={handleSend}>Send</button>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardMessageView;
