import React, { useState, useEffect, useRef } from 'react';
import styles from './dashboardMessageView.module.css';
import { IoMdSend } from 'react-icons/io';

const Dashboard_MessageView = ({ message, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const messageAreaRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageAreaRef.current && message) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [message]);

  // Focus input when message is selected
  useEffect(() => {
    if (message && inputRef.current) {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [message]);

  if (!message) {
    return (
      <div className={styles.container}>
        <div className={styles.messageview}>
          <p>Select a conversation to view messages</p>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if (newMessage.trim() === '') return;

    onSendMessage(newMessage);
    setNewMessage('');
    
    // Keep focus on input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.container}>
      {/* Sticky Header */}
      <div className={styles.metaHeader}>
        <span className={styles.dateTag}>
          {message.date || new Date().toLocaleDateString()}
        </span>
      </div>

      {/* Scrollable Message Area */}
      <div className={styles.messageArea} ref={messageAreaRef}>
        {message.messages && message.messages.length > 0 ? (
          message.messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.sender === 'user' ? styles.outgoingMsg : styles.incomingMsg
              }
            >
              {msg.text}
            </div>
          ))
        ) : (
          <div className={styles.messageview}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>

      {/* Sticky Input Bar */}
      <div className={styles.replyBar}>
        <div className={styles.inputSection}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Message input"
          />
          <button 
            onClick={handleSend}
            disabled={!newMessage.trim()}
            aria-label="Send message"
            title="Send message"
          >
            <IoMdSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard_MessageView;
