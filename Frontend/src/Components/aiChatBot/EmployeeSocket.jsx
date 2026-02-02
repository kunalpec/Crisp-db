import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";

export const EmployeeSocket = () => {
  const [waitingRooms, setWaitingRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [activeVisitorSessionId, setActiveVisitorSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [visitorTyping, setVisitorTyping] = useState(false);
  const [visitorOnline, setVisitorOnline] = useState(true); // ✅ FIX

  const typingRef = useRef(null);
  const requestedOnceRef = useRef(false);

  /* =====================================================
     SOCKET SETUP (EVENT STYLE)
  ===================================================== */
  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on("connect", () => {
      if (!requestedOnceRef.current) {
        socket.emit("employee:waiting");
        requestedOnceRef.current = true;
      }
    });

    socket.on("employee:waiting-rooms", (rooms) => {
      setWaitingRooms(
        rooms.map((room) => ({
          visitorSessionId: room.visitor_id.session_id,
          user_info: room.visitor_id.user_info,
          current_page: room.visitor_id.current_page,
        }))
      );
    });

    socket.on("visitor:connected", (data) => {
      setWaitingRooms((prev) =>
        prev.some(v => v.visitorSessionId === data.visitorSessionId)
          ? prev
          : [
            ...prev,
            {
              visitorSessionId: data.visitorSessionId,
              user_info: data.user_info,
              current_page: data.current_page,
            },
          ]
      );
    });

    socket.on("visitor:disconnected", ({ visitorSessionId }) => {
      // 🔴 Only active visitor goes offline
      if (visitorSessionId === activeVisitorSessionId) {
        setVisitorOnline(false);
      }

      // ❌ Remove from waiting list
      setWaitingRooms((prev) =>
        prev.filter(
          (room) => room.visitorSessionId !== visitorSessionId
        )
      );
    });

    socket.on("visitor:back-to-waiting", ({ visitorSessionId }) => {
      if (visitorSessionId === activeVisitorSessionId) {
        setActiveRoomId(null);
        setActiveVisitorSessionId(null);
        setMessages([]);
        setVisitorTyping(false);
        setVisitorOnline(true);
      }

      setWaitingRooms((prev) =>
        prev.some(v => v.visitorSessionId === visitorSessionId)
          ? prev
          : [...prev, { visitorSessionId }]
      );
    });

    socket.on("visitor:assigned", ({ roomId, visitorSessionId }) => {
      setWaitingRooms((prev) =>
        prev.filter(
          (room) => room.visitorSessionId !== visitorSessionId
        )
      );
    });

    socket.on("employee:joined-room-success", ({ roomId, visitorSessionId }) => {
      setActiveRoomId(roomId);
      setActiveVisitorSessionId(visitorSessionId);
      setMessages([]);
      setVisitorTyping(false);
      setVisitorOnline(true);
    })


    socket.on("employee:left-room-success", () => {
      setActiveRoomId(null);
      setActiveVisitorSessionId(null);
      setMessages([]);
      setVisitorTyping(false);
    });

    socket.on("message:received", (msg) => {
      if (msg.senderType !== "agent") {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("typing", () => setVisitorTyping(true));
    socket.on("stopTyping", () => setVisitorTyping(false));

    return () => {
      socket.off("connect");
      socket.off("employee:waiting-rooms");
      socket.off("visitor:connected");
      socket.off("visitor:disconnected");
      socket.off("visitor:back-to-waiting");
      socket.off("visitor:assigned");
      socket.off("employee:left-room-success");
      socket.off("message:received");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, []);

  /* =====================================================
     JOIN VISITOR
  ===================================================== */
  const handleJoinRoom = (visitorSessionId) => {
    if (activeVisitorSessionId) handleLeaveButton();
    socket.emit("joinVisitorRoom", { visitorSessionId });
  };

  /* =====================================================
     SEND MESSAGE
  ===================================================== */
  const sendMessage = () => {
    if (!text.trim() || !activeRoomId) return;

    setMessages((prev) => [
      ...prev,
      { messageId: Date.now(), senderType: "agent", message: text },
    ]);

    socket.emit("message:send", {
      roomId: activeRoomId,
      message: text,
    });

    setText("");
    socket.emit("stopTyping", { roomId: activeRoomId });
  };

  /* =====================================================
     TYPING
  ===================================================== */
  useEffect(() => {
    if (!activeRoomId || !text) return;

    socket.emit("typing", { roomId: activeRoomId });
    clearTimeout(typingRef.current);

    typingRef.current = setTimeout(() => {
      socket.emit("stopTyping", { roomId: activeRoomId });
    }, 1000);

    return () => clearTimeout(typingRef.current);
  }, [text, activeRoomId]);

  /* =====================================================
     LEAVE ROOM
  ===================================================== */
  const handleLeaveButton = () => {
    socket.emit("leaveVisitorRoom", {
      visitorSessionId: activeVisitorSessionId,
    });
  };

  /* =====================================================
     UI
  ===================================================== */
  return (
    <div>
      <h2>Employee Dashboard</h2>

      <h3>Waiting Visitors</h3>
      {waitingRooms.map((room) => (
        <div key={room.visitorSessionId}>
          {room.visitorSessionId}
          <button onClick={() => handleJoinRoom(room.visitorSessionId)}>
            Join
          </button>
        </div>
      ))}

      {activeRoomId && (
        <>
          <h3>
            Chat Room {activeRoomId}
            {!visitorOnline && (
              <span style={{ color: "red" }}> (Offline)</span>
            )}
          </h3>

          {messages.map((m) => (
            <div key={m.messageId}>
              <b>{m.senderType}:</b> {m.message}
            </div>
          ))}

          {visitorTyping && <em>Visitor is typing...</em>}

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!visitorOnline}
          />
          <button onClick={sendMessage} disabled={!visitorOnline}>
            Send
          </button>
          <button onClick={handleLeaveButton}>Leave</button>
        </>
      )}
    </div>
  );
};
