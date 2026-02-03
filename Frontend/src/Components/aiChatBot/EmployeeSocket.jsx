import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import "./EmployeeSocket.css";

export const EmployeeSocket = () => {
  const [waitingRooms, setWaitingRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [activeVisitorSessionId, setActiveVisitorSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [visitorTyping, setVisitorTyping] = useState(false);
  const [visitorOnline, setVisitorOnline] = useState(true);

  const typingRef = useRef(null);
  const requestedOnceRef = useRef(false);

  // socket
  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on("connect", () => {

      // request the backend *
      if (!requestedOnceRef.current) {
        socket.emit("employee:waiting");
        requestedOnceRef.current = true;
      }
    });

    // listen waiting visitor *
    socket.on("employee:waiting-rooms", (rooms) => {
      setWaitingRooms((prev) => {
        const seen = new Set(prev);

        const newRooms = rooms.filter((sessionId) => {
          if (!sessionId || seen.has(sessionId)) return false;
          seen.add(sessionId);
          return true;
        });

        return [...prev, ...newRooms];
      });
    });




    // visitior connected *
    socket.on("visitor:connected", ({ visitorSessionId }) => {
      setWaitingRooms((prev) =>
        prev.includes(visitorSessionId)
          ? prev
          : [...prev, visitorSessionId]
      );
    });


    // after leaving the agent to room *
    socket.on("visitor:back-to-waiting", ({ visitorSessionId }) => {
      if (visitorSessionId === activeVisitorSessionId) {
        resetActiveChat();
      }

      setWaitingRooms((prev) =>
        prev.includes(visitorSessionId)
          ? prev
          : [...prev, visitorSessionId]
      );
    });


    // visitior disconnected
    socket.on("visitor:disconnected", ({ visitorSessionId }) => {
      if (visitorSessionId === activeVisitorSessionId) {
        setVisitorOnline(false);
      }
    });

    // Remove visitor from Online row
    socket.on("visitor:assigned", ({ visitorSessionId }) => {
      setWaitingRooms((prev) =>
        prev.filter((id) => id !== visitorSessionId)
      );
    });


    // reconnect to the visitior room *
    socket.on("employee:reconnected-room", ({ room_id, visitor_id }) => {
      setActiveRoomId(room_id);
      setActiveVisitorSessionId(visitor_id);
      setVisitorOnline(true);

    });

    // employee joint the room of visitior *
    socket.on("employee:joined-room-success", ({ roomId, visitorSessionId }) => {
      setActiveRoomId(roomId);
      setActiveVisitorSessionId(visitorSessionId);
      setMessages([]);
      setVisitorTyping(false);
      setVisitorOnline(true);

      setWaitingRooms((prev) =>
        prev.filter((id) => id !== visitorSessionId)
      );
    });

    // employee left the room *
    socket.on("employee:left-room-success", () => {
      resetActiveChat();
    });

    // get the message
    socket.on("message:received", (msg) => {
      if (msg.senderType !== "agent") {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // visitor typing *
    socket.on("typing", () => setVisitorTyping(true));

    // visitor stop tryping *
    socket.on("stopTyping", () => setVisitorTyping(false));

    // employee disconnected *
    socket.on("employee:disconnected", ({ userId, companyId }) => {
      console.log("Employee disconnected:", userId, companyId)


    });

    // get the notification of other employee connected  or itself*
    socket.on("employee:connected", ({ userId, companyId }) => {
      console.log("Employee connected:", userId, companyId)
    });

    // CORRECTED: visitor reconnected *
    socket.on("visitor:reconnected", ({ visitorSessionId, roomId }) => {
      // 1. Mark visitor as online immediately
      setVisitorOnline(true);

      if (visitorSessionId === activeVisitorSessionId) {
        // 2. Ensure room ID is synced
        setActiveRoomId(roomId);

        // 3. Add a "System" message to the chat list
        const systemMsg = {
          messageId: Date.now(),
          senderType: "system",
          message: "Visitor connection restored. They are back online.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, systemMsg]);
      } else {
        // 4. If they were in the waiting list, remove them (since they are now active/assigned)
        setWaitingRooms((prev) =>
          prev.filter((id) => id !== visitorSessionId)
        );
      }
    });

    // ✅ visitor intentionally left the chat
    socket.on("visitor:left-chat", ({ visitorSessionId, roomId }) => {
      // If employee is currently chatting with this visitor
      if (visitorSessionId === activeVisitorSessionId) {
        const systemMsg = {
          messageId: Date.now(),
          senderType: "system",
          message: "Visitor left the chat.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, systemMsg]);

        // Reset active chat state
        setVisitorOnline(false);
        setActiveRoomId(null);
        setActiveVisitorSessionId(null);
        setVisitorTyping(false);
      }

      // Also ensure visitor is removed from waiting list
      setWaitingRooms((prev) =>
        prev.filter((id) => id !== visitorSessionId)
      );
    });


    return () => {
      socket.off("visitor:connected");
      socket.off("employee:waiting-rooms");

      socket.off("visitor:back-to-waiting");
      socket.off("visitor:disconnected");
      socket.off("visitor:left-chat");


      socket.off("employee:joined-room-success");
      socket.off("employee:left-room-success");
      socket.off("message:received");

      socket.off("employee:disconnected");
      socket.off("employee:reconnected-room");
      socket.off("visitor:reconnected");

      socket.off("typing");
      socket.off("stopTyping");

      socket.off("visitor:assigned");
      socket.off("employee:connected");
    };
  }, []);

  const resetActiveChat = () => {
    setActiveRoomId(null);
    setActiveVisitorSessionId(null);
    setMessages([]);
    setVisitorTyping(false);
    setVisitorOnline(true);
  };

  // handle join room 
  const handleJoinRoom = (visitorSessionId) => {
    if (activeVisitorSessionId) {
      handleLeaveButton()
    };
    socket.emit("joinVisitorRoom", { visitorSessionId });
  };


  // send messages 
  const sendMessage = () => {
    if (!text.trim() || !activeRoomId || !visitorOnline) return;

    const msg = {
      messageId: Date.now(),
      senderType: "agent",
      message: text,
    };

    setMessages((prev) => [...prev, msg]);

    socket.emit("message:send", {
      roomId: activeRoomId,
      message: text,
    });

    setText("");
    socket.emit("stopTyping", { roomId: activeRoomId });
  };

  // typing employee
  useEffect(() => {
    if (!activeRoomId || !text) return;

    socket.emit("typing", { roomId: activeRoomId });
    clearTimeout(typingRef.current);

    typingRef.current = setTimeout(() => {
      socket.emit("stopTyping", { roomId: activeRoomId });
    }, 1000);

    return () => clearTimeout(typingRef.current);
  }, [text, activeRoomId]);


  // leave the room 
  const handleLeaveButton = () => {
    if (activeRoomId) {
      socket.emit("leaveVisitorRoom", { visitorSessionId: activeVisitorSessionId });
    }
  };


  /* ================= UI ================= */
  return (
    <div className="employee-dashboard">
      <h2 className="dashboard-title">Employee Dashboard</h2>

      <div className="layout">
        <div className="waiting-panel">
          <h3>Waiting Visitors</h3>

          {waitingRooms.length === 0 && (
            <p className="empty-text">No waiting visitors</p>
          )}

          {waitingRooms.map((sessionId) => (
            <div className="waiting-item" key={sessionId}>
              <span className="visitor-id">{sessionId}</span>
              <button
                className="join-btn"
                onClick={() => handleJoinRoom(sessionId)}
              >
                Join
              </button>
            </div>
          ))}

        </div>

        {activeRoomId && (
          <div className="chat-panel">
            <div className="chat-header">
              <h3>
                Chat Room
                <span className="room-id">{activeRoomId}</span>
              </h3>

              {!visitorOnline && (
                <span className="status-offline">Visitor Offline</span>
              )}
            </div>

            <div className="chat-messages">
              {messages.map((m) => (
                <div
                  key={m.messageId}
                  className={`message ${m.senderType === "agent"
                    ? "agent-message"
                    : "visitor-message"
                    }`}
                >
                  {m.message}
                </div>
              ))}

              {visitorTyping && (
                <div className="typing-indicator">
                  Visitor is typing...
                </div>
              )}
            </div>

            <div className="chat-input">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={!visitorOnline}
                placeholder={
                  visitorOnline
                    ? "Type your message..."
                    : "Visitor offline"
                }
              />
              <button
                onClick={sendMessage}
                disabled={!visitorOnline}
                className="send-btn"
              >
                Send
              </button>
              <button
                onClick={handleLeaveButton}
                className="leave-btn"
              >
                Leave
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
