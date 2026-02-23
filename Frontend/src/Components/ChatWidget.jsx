import React, { useState, useEffect } from "react";
import VisitorChatRoom from "../Components/AIChatBot/VisitorChatRoom";
import "./ChatWidget.css";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("apiKey");
    setApiKey(key);
  }, []);

  return (
    <>
      <button
        className="chat-float-btn"
        onClick={() => setOpen((prev) => !prev)}
      >
        💬
      </button>

      {open && apiKey && (
        <div className="chat-popup">
          <VisitorChatRoom apiKey={apiKey} />
        </div>
      )}
    </>
  );
};

export default ChatWidget;