import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";

export const EmployeeSocket = () => {
  const [waitingRooms, setWaitingRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    // ================= CONNECT =================
    socket.on("connect", () => {
      console.log("Employee socket connected:", socket.id);

      // ✅ start polling ONLY after connect
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          socket.emit("employee:waiting");
        }, 15000); // testing
      }
    });

    socket.on("employee:connected", (data) => {
      console.log("Employee verified:", data);
    });

    socket.on("employee:verify-success", ({ room_id }) => {
      console.log("Room verified:", room_id);
      socket.emit("employee:join-room", { room_id });
    });

    socket.on("employee:verify-failed", (msg) => {
      console.error("Verify failed:", msg);
    });

    // 🔥 backend sends ARRAY
    socket.on("employee:waiting-rooms", (rooms) => {
      console.log("Waiting rooms:", rooms);
      setWaitingRooms(rooms);
    });

    socket.on("employee:waiting-error", (msg) => {
      console.error("Waiting error:", msg);
    });

    return () => {
      socket.off("connect");
      socket.off("employee:connected");
      socket.off("employee:verify-success");
      socket.off("employee:verify-failed");
      socket.off("employee:waiting-rooms");
      socket.off("employee:waiting-error");

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  /* ================= JOIN ROOM ================= */
  const handleJoinRoom = (room_id) => {
    if (!socket.connected) return;

    setSelectedRoomId(room_id);
    socket.emit("employee:verify-room", { room_id });
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
            onClick={() => handleJoinRoom(room.room_id)}
          >
            Join
          </button>
        </div>
      ))}

      {selectedRoomId && <p>Selected Room: {selectedRoomId}</p>}
    </div>
  );
};
