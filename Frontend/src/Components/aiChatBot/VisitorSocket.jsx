import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import { createSession } from "./createSession";
import "./VisitorSocket.css";

export const VisitorSocket = () => {
  const [text, setText] = useState("");
  const [roomId, setRoomId] = useState(null);
  const [employeeTyping, setEmployeeTyping] = useState(false);
  const [agentOnline, setAgentOnline] = useState(false);
  const [messages, setMessages] = useState([]);

  const typingRef = useRef(null);
  const sessionRef = useRef();

  // send messages 
  const submitMessage = () => {
    const trimmed = text.trim();
    if (!trimmed || !roomId || !agentOnline) return;

    const localMessage = {
      messageId: Date.now(),
      senderType: "visitor",
      message: trimmed,
    };

    setMessages((prev) => [...prev, localMessage]);

    socket.emit("message:send", {
      roomId,
      message: trimmed,
    });

    setText("");
    socket.emit("stopTyping", { roomId });
  };

  // visitio is typing 
  useEffect(() => {
    if (!roomId || !agentOnline) return;

    if (text) {
      socket.emit("typing", { roomId });

      clearTimeout(typingRef.current);
      typingRef.current = setTimeout(() => {
        socket.emit("stopTyping", { roomId });
      }, 1000);
    }

    return () => clearTimeout(typingRef.current);
  }, [text, roomId, agentOnline]);


  // handle r=leave room
  const handleLeaveButton = () => {
    socket.emit("visitor:leave-chat", {
      session_id: sessionRef.current,
    });

    // reset local UI immediately
    setRoomId(null);
    setAgentOnline(false);
    setEmployeeTyping(false);
    setMessages((prev) => [
      ...prev,
      {
        messageId: Date.now(),
        senderType: "system",
        message: "You left the chat.",
      },
    ]);
  };

  // socket 
  useEffect(() => {
    if (!sessionRef.current) {
      sessionRef.current = createSession();
    }
    const sessionId = sessionRef.current;


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

    // get self connection notification *
    socket.on("visitor:connected", (data) => {
      if (data?.roomId) {
        setRoomId(data.roomId);
      }
    });

    // agent join the room *
    socket.on("employee:joined-room", ({ roomId, agentpresent }) => {
      setRoomId(roomId);
      setAgentOnline(agentpresent);

      if (agentpresent) {
        setMessages((prev) => [
          ...prev,
          {
            messageId: Date.now(),
            senderType: "system",
            message: "Agent joined the chat",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            messageId: Date.now(),
            senderType: "system",
            message: "Waiting for agent to reconnect...",
          },
        ]);
      }
    });


    // agent reconnected *
    socket.on("visitor:agent-reconnected", () => {
      setAgentOnline(true);

      setMessages((prev) => [
        ...prev,
        {
          messageId: Date.now(),
          senderType: "system",
          message: "Agent reconnected",
        },
      ]);
    });

    // agent left the room *
    socket.on("employee:left-room", (data) => {
      setAgentOnline(false);
      setEmployeeTyping(false);
      setRoomId(null);

      setMessages((prev) => [
        ...prev,
        {
          messageId: Date.now(),
          senderType: "system",
          message: data?.message || "Agent left the chat",
        },
      ]);
    });

    /* ===== RECEIVE MESSAGES ===== */
    socket.on("message:received", (msg) => {
      if (msg.senderType === "visitor") return;
      setMessages((prev) => [...prev, msg]);
    });

    // typing and stopping *
    socket.on("typing", () => setEmployeeTyping(true));
    socket.on("stopTyping", () => setEmployeeTyping(false));

    socket.on("verify:failed", (msg) => {
      console.error("Verify failed:", msg);
    });

    return () => {
      socket.off("visitor:connected");
      socket.off("employee:joined-room");
      socket.off("visitor:agent-reconnected");
      socket.off("employee:left-room");
      socket.off("message:received");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("backend:verify-request");
      socket.off("verify:failed");
    };
  }, []);

  /* ================= UI ================= */
  return (
    <div className="visitor-container">
      <div className="visitor-header">
        <h3>Chat with Us</h3>
        {!agentOnline && (
          <span className="agent-status offline">Agent Offline</span>
        )}
        {agentOnline && (
          <span className="agent-status online">Agent Online</span>
        )}
      </div>

      <div className="visitor-messages">
        {messages.map((msg) => (
          <div
            key={msg.messageId}
            className={`visitor-message ${msg.senderType === "visitor"
              ? "visitor-msg"
              : msg.senderType === "system"
                ? "system-msg"
                : "agent-msg"
              }`}
          >
            {msg.message}
          </div>
        ))}

        {employeeTyping && agentOnline && (
          <div className="typing-indicator">Agent is typing...</div>
        )}
      </div>

      <div className="visitor-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            agentOnline ? "Type your message..." : "Waiting for agent..."
          }
          disabled={!agentOnline}
          onKeyDown={(e) => e.key === "Enter" && submitMessage()}
        />

        <button
          onClick={submitMessage}
          disabled={!roomId || !agentOnline}
        >
          Send
        </button>
        <button onClick={handleLeaveButton}>
          Leave room
        </button>
      </div>
    </div>
  );
};
