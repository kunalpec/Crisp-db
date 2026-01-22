import React, { useState } from 'react';
import styles from './dashboardMessageView.module.css';
import { IoMdSend } from 'react-icons/io';

const Dashboard_MessageView = ({ message, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');

  if (!message) {
    return (
      <div className={styles.container}>
        <p className={styles.messageview}>
          Select a conversation to view messages
        </p>
      </div>
    );
  }

  const handleSend = () => {
    if (newMessage.trim() === '') return;

    onSendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.metaHeader}>
        <span className={styles.dateTag}>{new Date().toLocaleDateString()}</span>
      </div>

      <div className={styles.messageArea}>
        {message.messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.sender === 'user' ? styles.incomingMsg : styles.outgoingMsg
            }
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Reply Section */}
      <div className={styles.replyBar}>
        <div className={styles.inputSection}>
          <input
            type="text"
            placeholder="Send your message to Crisp Team in chat…"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend}>
            <IoMdSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard_MessageView;
