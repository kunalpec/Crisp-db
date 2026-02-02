import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";

export const EmployeeSocket = () => {
  const [waitingRooms, setWaitingRooms] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const requestedOnceRef = useRef(false);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on("connect", () => {
      console.log("Employee socket connected:", socket.id);

      if (!requestedOnceRef.current) {
        socket.emit("employee:waiting");
        requestedOnceRef.current = true;
      }
    });

    socket.on("employee:connected", (data) => {
      console.log("Employee connected:", data);
    });

    // 🔥 Initial waiting rooms (normalize data)
    socket.on("employee:waiting-rooms", (rooms) => {
      const normalized = rooms.map((room) => ({
        room_id: room.room_id,
        visitorSessionId: room.visitor_id.session_id,
        user_info: room.visitor_id.user_info,
        current_page: room.visitor_id.current_page,
      }));

      setWaitingRooms(normalized);
    });

    // 🟢 New visitor
    socket.on("visitor:connected", ({ visitorSessionId, roomId, user_info, current_page }) => {
      setWaitingRooms((prev) => {
        if (prev.some((r) => r.visitorSessionId === visitorSessionId)) {
          return prev;
        }

        return [
          ...prev,
          {
            room_id: roomId,
            visitorSessionId,
            user_info,
            current_page,
          },
        ];
      });
    });

    // 🔴 Visitor disconnected
    socket.on("visitor:disconnected", ({ visitorSessionId }) => {
      setWaitingRooms((prev) =>
        prev.filter((room) => room.visitorSessionId !== visitorSessionId)
      );
    });

    // 🧹 Remove when assigned to agent
    socket.on("visitor:assigned", ({ visitorSessionId }) => {
      setWaitingRooms((prev) =>
        prev.filter((room) => room.visitorSessionId !== visitorSessionId)
      );
    });

    return () => {
      socket.off("connect");
      socket.off("employee:connected");
      socket.off("employee:waiting-rooms");
      socket.off("visitor:connected");
      socket.off("visitor:reconnected");
      socket.off("visitor:disconnected");
      socket.off("visitor:assigned");
    };
  }, []);

  /* ================= JOIN ROOM ================= */
  const handleJoinRoom = (visitorSessionId) => {
    setSelectedSessionId(visitorSessionId);

    socket.emit("employee:join-visitor-room", {
      visitorSessionId,
    });
  };

  return (
    <div>
      <h2>Employee Dashboard</h2>

      <h3>Waiting Rooms</h3>

      {waitingRooms.length === 0 && <p>No waiting rooms</p>}

      {waitingRooms.map((room) => (
        <div key={room.room_id} style={{ marginBottom: "8px" }}>
          <span>{room.room_id}</span>
          <button
            style={{ marginLeft: "10px" }}
            onClick={() => handleJoinRoom(room.visitorSessionId)}
          >
            Join
          </button>
        </div>
      ))}

      {selectedSessionId && <p>Selected Visitor: {selectedSessionId}</p>}
    </div>
  );
};
