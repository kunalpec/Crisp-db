import React, { useState } from "react";
import VisitorChatRoom from "../Components/AIChatBot/VisitorChatRoom";
import "./ChatWidget.css"; // ✅ CSS Import

const ChatWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ✅ Floating Chat Button */}
      <button
        className="chat-float-btn"
        onClick={() => setOpen(!open)}
      >
        💬
      </button>

      {/* ✅ Popup Chat Box */}
      {open && (
        <div className="chat-popup">
          {/* Header */}
          <div className="chat-popup-header">
            Live Support

            <span
              className="chat-close-btn"
              onClick={() => setOpen(false)}
            >
              ✖
            </span>
          </div>

          {/* Chat Component */}
          <VisitorChatRoom />
        </div>
      )}
    </>
  );
};

export default ChatWidget;
