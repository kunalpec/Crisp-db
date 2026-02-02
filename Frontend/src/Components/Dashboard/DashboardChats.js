import React from 'react';
import styles from './dashboardChats.module.css';
import { FiFilter, FiPlus } from 'react-icons/fi';
import { FaArrowRight } from 'react-icons/fa';

const DashboardChats = ({ conversations, onMessageClick }) => {
  // Get last message text safely
  const getLastMessage = (conv) => {
    if (!conv.messages || conv.messages.length === 0) {
      return 'No messages yet';
    }
    const lastMsg = conv.messages[conv.messages.length - 1];
    return lastMsg.text || 'No messages yet';
  };

  return (
    <div className={styles['dashboardChats-container']}>
      {/* Sticky Header with Controls */}
      <div className={styles['dashboardChats-header']}>
        <div className={styles['dropdown']}>
          <select 
            aria-label="Filter conversations"
            style={{
              border: '1px solid #ddd',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: '#fff',
              outline: 'none',
            }}
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="spam">Spam</option>
          </select>
        </div>
        <div className={styles['icons']}>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: '#666',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.color = '#1976f2'}
            onMouseLeave={(e) => e.target.style.color = '#666'}
            aria-label="Filter"
            title="Filter conversations"
          >
            <FiFilter />
          </button>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: '#666',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.color = '#1976f2'}
            onMouseLeave={(e) => e.target.style.color = '#666'}
            aria-label="Add new conversation"
            title="New conversation"
          >
            <FiPlus />
          </button>
        </div>
      </div>

      {/* Scrollable Message List */}
      <div className={styles['dashboardChats-list']}>
        {conversations && conversations.length > 0 ? (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={styles['message-card']}
              onClick={() => onMessageClick(conv)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onMessageClick(conv);
                }
              }}
              aria-label={`Conversation with ${conv.sender}`}
            >
              <div className={styles['message-left']}>
                {/* Avatar placeholder - can be replaced with actual image */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#1976f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '16px',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  {conv.sender ? conv.sender.charAt(0).toUpperCase() : '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: 0, marginBottom: '4px' }}>{conv.sender || 'Unknown'}</h4>
                  <p style={{ margin: 0, color: '#666' }}>{getLastMessage(conv)}</p>
                </div>
              </div>
              <div className={styles['message-right']}>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>
                  {conv.date || new Date().toLocaleDateString()}
                </span>
                <FaArrowRight 
                  className={styles['arrow']}
                  style={{ marginTop: '4px' }}
                  aria-hidden="true"
                />
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              color: '#999',
              fontSize: '14px',
            }}
          >
            No conversations yet
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardChats;
