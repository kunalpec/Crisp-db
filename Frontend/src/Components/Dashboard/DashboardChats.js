import React from "react";
import styles from "./dashboardChats.module.css";
import { FiFilter, FiPlus } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa";

const DashboardChats = ({ rooms, onRoomClick }) => {
  return (
    <div className={styles["dashboardChats-container"]}>
      {/* Header */}
      <div className={styles["dashboardChats-header"]}>
        <div>
          <select>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="waiting">Waiting</option>
          </select>
        </div>

        <div className={styles["icons"]}>
          <FiFilter />
          <FiPlus />
        </div>
      </div>

      {/* Chat Room List */}
      <div className={styles["dashboardChats-list"]}>
        {rooms && rooms.length > 0 ? (
          rooms.map((room) => (
            <div
              key={room.room_id}
              className={styles["message-card"]}
              onClick={() => onRoomClick(room)}
            >
              <div className={styles["message-left"]}>
                {/* Avatar */}
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#1976f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: "600",
                  }}
                >
                  {room.session_id
                    ? room.session_id.charAt(0).toUpperCase()
                    : "V"}
                </div>

                <div>
                  <h4 style={{ margin: 0 }}>
                    Visitor: {room.session_id}
                  </h4>

                  <p style={{ margin: 0, color: "#666" }}>
                    Status: {room.status}
                  </p>
                </div>
              </div>

              <div className={styles["message-right"]}>
                <span style={{ fontSize: "0.75rem", color: "#888" }}>
                  {room.last_message_at
                    ? new Date(
                        room.last_message_at
                      ).toLocaleDateString()
                    : ""}
                </span>

                <FaArrowRight className={styles["arrow"]} />
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "#999",
            }}
          >
            No active chat rooms
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardChats;
