import React, { useState, useEffect, useRef } from "react";
import styles from "./dashboardMessageView.module.css";
import { IoMdSend } from "react-icons/io";

const Dashboard_MessageView = ({ messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState("");
  const messageAreaRef = useRef(null);
  const inputRef = useRef(null);

  // ===============================
  // AUTO SCROLL
  // ===============================
  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop =
        messageAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // ===============================
  // FOCUS INPUT
  // ===============================
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages]);

  // ===============================
  // NO ROOM SELECTED
  // ===============================
  if (!messages) {
    return (
      <div className={styles.container}>
        <div className={styles.messageview}>
          <p>Select a chat room to view messages</p>
        </div>
      </div>
    );
  }

  // ===============================
  // SEND MESSAGE
  // ===============================
  const handleSend = () => {
    if (!newMessage.trim()) return;

    onSendMessage(newMessage);
    setNewMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.container}>
      {/* Scrollable Message Area */}
      <div className={styles.messageArea} ref={messageAreaRef}>
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg._id || Math.random()}
              className={
                msg.sender_type === "agent"
                  ? styles.outgoingMsg
                  : styles.incomingMsg
              }
            >
              {msg.content}
            </div>
          ))
        ) : (
          <div className={styles.messageview}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className={styles.replyBar}>
        <div className={styles.inputSection}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
          >
            <IoMdSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard_MessageView;
