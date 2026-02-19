import React from "react";
import styles from "./dashboardChats.module.css";

/* ==============================
   RANDOM COLOR GENERATOR
============================== */
const getRandomColor = () => {
  const colors = [
    "#60a5fa",
    "#34d399",
    "#f472b6",
    "#facc15",
    "#a78bfa",
    "#fb7185",
    "#38bdf8",
  ];

  const randomIndex = Math.floor(Math.random() * colors.length);

  return colors[randomIndex];
};


/* ==============================
   FORMAT VISITOR NAME
============================== */
const formatVisitorName = (index) => {
  return `visitor${index + 1}`;
};

const DashboardChats = ({ waitingVisitors, unreadRooms, onSelectVisitor }) => {
  return (
    <div className={styles.sidebar}>
      {/* HEADER */}
      <div className={styles.header}>
        <h3>Inbox</h3>
      </div>

      {/* EMPTY */}
      {waitingVisitors.length === 0 && (
        <p className={styles.empty}>No visitors waiting</p>
      )}

      {/* VISITOR LIST */}
      {waitingVisitors.map((v, index) => (
        <div
          key={v.room_id}
          className={styles.visitorItem}
          onClick={() => onSelectVisitor(v)}
        >
          {/* AVATAR */}
          <div
            className={styles.avatar}
            style={{
              backgroundColor: getRandomColor(),
            }}
          >
            {formatVisitorName(index).charAt(0).toUpperCase()}
          </div>

          {/* VISITOR INFO */}
          <div className={styles.visitorInfo}>
            {/* Name */}
            <p className={styles.name}>{formatVisitorName(index)}</p>

            {/* Session ID small + left aligned */}
            <p className={styles.sessionId}>{v.session_id}</p>
          </div>

          {/* RIGHT SIDE */}
          <div className={styles.rightSide}>
            {/* UNREAD BADGE */}
            {unreadRooms[v.room_id] > 0 && (
              <span className={styles.badge}>
                {unreadRooms[v.room_id]}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardChats;
