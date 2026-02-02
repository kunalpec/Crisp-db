import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import { createSession } from "./createSession";

export const VisitorSocket = () => {
  const [text, setText] = useState("");
  const [roomId, setRoomId] = useState("");
  const [employeeTyping, setEmployeeTyping] = useState(false);
  const [messages, setMessages] = useState([]);

  const typingRef = useRef(null);

  /* =====================================================
     SEND MESSAGE (OPTIMISTIC)
  ===================================================== */
  const submitMessage = () => {
    const trimmed = text.trim();
    if (!trimmed || !roomId) return;

    // ✅ ADD VISITOR MESSAGE LOCALLY (instant UI)
    const localMessage = {
      messageId: Date.now(),
      senderType: "visitor",
      message: trimmed,
    };

    setMessages((prev) => [...prev, localMessage]);

    // send to backend
    socket.emit("message:send", {
      roomId,
      message: trimmed,
    });

    setText("");
    socket.emit("stopTyping", { roomId });
  };

  /* =====================================================
     VISITOR TYPING (DEBOUNCED)
  ===================================================== */
  useEffect(() => {
    if (!roomId) return;

    if (text) {
      socket.emit("typing", { roomId });

      if (typingRef.current) clearTimeout(typingRef.current);

      typingRef.current = setTimeout(() => {
        socket.emit("stopTyping", { roomId });
      }, 1000);
    }

    return () => typingRef.current && clearTimeout(typingRef.current);
  }, [text, roomId]);

  /* =====================================================
     SOCKET CONNECTION + EVENTS
  ===================================================== */
  useEffect(() => {
    const sessionId = createSession();

    if (!socket.connected) socket.connect();

    socket.on("connect", () => {
      socket.emit("visitor:hello", { session_id: sessionId });
    });

    socket.on("backend:verify-request", () => {
      socket.emit("frontend:verify-response", {
        session_id: sessionId,
        company_apikey:
          "0630385bfb1a193c90118d0a22769d66220c8b6916df87da7456a1e4904d40cc",
        user_info: {
          browser: navigator.userAgent,
          platform: navigator.userAgentData?.platform || "unknown",
          mobile: navigator.userAgentData?.mobile || false,
        },
        current_page: window.location.pathname,
      });
    });

    socket.on("visitor:connected", (data) => {
      if (data?.roomId) setRoomId(data.roomId);
    });

    socket.on("verify:failed", (msg) => {
      console.error("Verify failed:", msg);
    });

    /* ================= RECEIVE EMPLOYEE MESSAGES ================= */
    socket.on("message:received", (msg) => {
      // ignore duplicate visitor echo (if backend ever sends it)
      if (msg.senderType === "visitor") return;

      setMessages((prev) => [...prev, msg]);
    });

    /* ================= TYPING ================= */
    socket.on("typing", () => setEmployeeTyping(true));
    socket.on("stopTyping", () => setEmployeeTyping(false));

    /* ================= AGENT LEFT ================= */
    socket.on("employee:left-room", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          messageId: Date.now(),
          senderType: "system",
          message: data?.message || "Agent left the chat",
        },
      ]);
      setEmployeeTyping(false);
    });

    return () => {
      socket.off("connect");
      socket.off("backend:verify-request");
      socket.off("visitor:connected");
      socket.off("verify:failed");
      socket.off("message:received");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("employee:left-room");
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h3>Visitor Connected</h3>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "200px",
          overflowY: "auto",
          marginBottom: "8px",
        }}
      >
        {messages.map((msg) => (
          <div key={msg.messageId}>
            <b>{msg.senderType}:</b> {msg.message}
          </div>
        ))}

        {employeeTyping && <em>Agent is typing...</em>}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type message..."
        onKeyDown={(e) => e.key === "Enter" && submitMessage()}
      />

      <button onClick={submitMessage} disabled={!roomId}>
        Send
      </button>
    </div>
  );
};
