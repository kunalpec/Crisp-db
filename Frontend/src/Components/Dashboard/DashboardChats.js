import React from 'react';
import styles from './dashboardChats.module.css';
import { FiFilter, FiPlus } from 'react-icons/fi';
import { FaArrowRight } from 'react-icons/fa';

const DashboardChats = ({ conversations, onMessageClick }) => {
  return (
    <div className={styles['dashboardChats-container']}>
      {/* Top Controls */}
      <div className={styles['dashboardChats-header']}>
        <div className={styles['dropdown']}>
          <select>
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="spam">Spam</option>
          </select>
        </div>
        <div className={styles['icons']}>
          <FiFilter />
          <FiPlus />
        </div>
      </div>

      {/* Message Cards */}
      {conversations.map((conv) => (
        <div
          key={conv.id}
          className={styles['message-card']}
          onClick={() => onMessageClick(conv)}
        >
          <div className={styles['message-left']}>
            <img src="#" alt="avatar" />
            <div>
              <h4>{conv.sender}</h4>
              <p>{conv.messages[conv.messages.length - 1].text}</p> {/* show last message */}
            </div>
          </div>
          <div className={styles['message-right']}>
            <span>{conv.date}</span>
            <FaArrowRight className={styles['arrow']} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardChats;
