import React, { useState, useEffect, useRef } from "react";
import { socket } from "../../socket";
import { createSession } from "./createSession";
import "./VisitorChatRoom.css";

const VisitorChatRoom = () => {

  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [agentOnline, setAgentOnline] = useState(false);
  const [visitorLeave, setVisitorLeave] = useState(false);
  const [employeeTyping, setEmployeeTyping] = useState(false);

  const sessionRef = useRef(null);
  const typingRef = useRef(null);
  const visitorRoomRef = useRef(null);

  /* -------------------------------------------------- */
  /* Helpers */

  const formatTime = (date = new Date()) => {
    const HH = String(date.getHours()).padStart(2, "0");
    const MM = String(date.getMinutes()).padStart(2, "0");
    return `${HH}:${MM}`;
  };

  const unique_id = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  /* -------------------------------------------------- */
  /* Submit Message */

  const handleSubmitMessage = () => {
    const textTrimmed = text.trim();

    if (!textTrimmed || !visitorRoomRef.current) return;

    const msgInfo = {
      msg_id: unique_id(),
      msg_content: textTrimmed,
      msg_type: "visitor",
      room_id: visitorRoomRef.current,
      send_at: formatTime(),
    };

    // Optimistic UI
    setMessages((prev) => [...prev, msgInfo]);

    if (socket?.connected) {
      socket.emit("visitor:sending-message-to-employee", msgInfo);
    }

    setText("");
  };

  /* -------------------------------------------------- */
  /* Typing */

  useEffect(() => {
    if (!socket?.connected || !visitorRoomRef.current) return;

    if (text.length > 0) {
      socket.emit("visitor:me-typing", {
        room_id: visitorRoomRef.current,
      });
    }

    if (typingRef.current) clearTimeout(typingRef.current);

    typingRef.current = setTimeout(() => {
      socket.emit("visitor:me-stoptyping", {
        room_id: visitorRoomRef.current,
      });
    }, 1000);

    return () => {
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, [text]);

  /* -------------------------------------------------- */
  /* Leave */

  const handleLeaveRoom = () => {
    if (!socket?.connected) return;

    socket.emit("visitor:leave-room", {
      session_id: sessionRef.current,
      room_id: visitorRoomRef.current,
      company_apikey: window?.ChatWidgetConfig?.apiKey,
    });

    setVisitorLeave(true);
  };

  /* -------------------------------------------------- */
  /* Socket Connection */

  useEffect(() => {

    if (!sessionRef.current) {
      sessionRef.current = createSession();
    }

    const sessionId = sessionRef.current;

    if (!socket.connected) {
      socket.connect();
    }

    const config = window?.ChatWidgetConfig;

    /* CONNECT HANDLER */
    const handleConnect = () => {
      console.log(`visitor connected: ${sessionId}`);

      socket.emit("visitor:resume-chat", {
        company_apikey: config?.apiKey,
        session_id: sessionId,
      });

      socket.emit("visitor:create-new", {
        company_apikey: config?.apiKey,
        session_id: sessionId,
      });
    };

    socket.on("connect", handleConnect);

    /* -------------------------------------------------- */
    /* MESSAGE RECEIVE */

    socket.on("chat:new-message", (msg) => {

      const formattedMsg = {
        msg_id: msg.msg_id,
        msg_content: msg.msg_content,
        msg_type: msg.sender_type === "visitor" ? "visitor" : "agent",
        room_id: msg.room_id,
        send_at: formatTime(new Date(msg.send_at)),
      };

      visitorRoomRef.current = msg.room_id;

      setMessages((prev) => [...prev, formattedMsg]);
    });

    /* -------------------------------------------------- */
    /* AGENT STATUS EVENTS */

    socket.on("visitor:agent-reconnected", () => {
      setAgentOnline(true);
    });

    socket.on("visitor:agent-disconnected", () => {
      setAgentOnline(false);
    });

    socket.on("visitor:agent-left", () => {
      setAgentOnline(false);
    });

    /* -------------------------------------------------- */
    /* TYPING */

    socket.on("employee:typing", () => {
      setEmployeeTyping(true);
    });

    socket.on("employee:stop-typing", () => {
      setEmployeeTyping(false);
    });

    /* -------------------------------------------------- */
    /* CLEANUP */

    return () => {
      socket.off("connect", handleConnect);
      socket.off("chat:new-message");
      socket.off("visitor:agent-reconnected");
      socket.off("visitor:agent-disconnected");
      socket.off("visitor:agent-left");
      socket.off("employee:typing");
      socket.off("employee:stop-typing");
    };

  }, []);

  /* -------------------------------------------------- */
  /* UI */

  return (
    <div className="chat-container">

      <div className="chat-header">
        <span>Live Support</span>
        <span className={agentOnline ? "status-online" : "status-offline"}>
          {agentOnline ? "Agent Online" : "Waiting for Agent"}
        </span>
      </div>

      <div className="chat-messages">

        {messages.length === 0 && (
          <div className="no-messages">No messages yet</div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.msg_id}
            className={`message-row ${msg.msg_type}`}
          >
            <div className={`message-bubble ${msg.msg_type}`}>
              <div>{msg.msg_content}</div>
              <div className="message-time">{msg.send_at}</div>
            </div>
          </div>
        ))}

        {employeeTyping && (
          <div className="typing-text">Agent is typing...</div>
        )}

        {visitorLeave && (
          <div className="leave-text">You left the chat</div>
        )}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmitMessage();
            }
          }}
        />
        <button
          className="send-btn"
          onClick={handleSubmitMessage}
        >
          Send
        </button>
      </div>

      {/* Optional Leave Button */}
      <button className="leave-btn" onClick={handleLeaveRoom}>
        Leave Chat
      </button>

    </div>
  );
};

export default VisitorChatRoom;
