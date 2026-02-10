import React, { useState } from "react";
import VisitorChatRoom from "./VisitorChatRoom";
import EmployeeChatRoom from "./EmployeeChatRoom";
import TestLogin from "./TestLogin";
import "./ChatBoard.css";

const ChatBoard = () => {
  const [role, setRole] = useState(null);

  const handleBack = () => {
    setRole(null);
  };

  return (
    <div className="chatboard-container">
      <div className="chatboard-box">

        {/* ROLE SELECTION SCREEN */}
        {!role && (
          <>
            <div className="chatboard-buttons">
              <button
                className="chatboard-btn"
                onClick={() => setRole("visitor")}
              >
                Visitor
              </button>

              <button
                className="chatboard-btn"
                onClick={() => setRole("employee")}
              >
                Employee
              </button>
            </div>

            {/* Optional login only for employee */}
            <TestLogin />
          </>
        )}

        {/* VISITOR PANEL */}
        {role === "visitor" && (
          <>
            <button className="chatboard-back-btn" onClick={handleBack}>
              ← Back
            </button>
            <VisitorChatRoom />
          </>
        )}

        {/* EMPLOYEE PANEL */}
        {role === "employee" && (
          <>
            <button className="chatboard-back-btn" onClick={handleBack}>
              ← Back
            </button>
            <EmployeeChatRoom />
          </>
        )}

      </div>
    </div>
  );
};

export default ChatBoard;
