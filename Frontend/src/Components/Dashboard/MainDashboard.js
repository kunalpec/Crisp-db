import React, { useState, useEffect } from 'react';
import DashboardNav from './DashboardNav';
import styles from './main-dashboard.module.css';
import DashboardChats from './DashboardChats';
import Dashboard_MessageView from './Dashboard_MessageView';

const MainDashboard = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const userId = '664c29b268463489c3f6dd4f'; // Consistent with seedChats.js

  // Fetch chats from backend
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/chat/get-chat/${userId}`);
        const data = await response.json();
        if (data && Array.isArray(data)) {
          // Map backend data to frontend format
          const formattedConversations = data.map((chat, index) => ({
            id: chat._id,
            sender: 'ChatBot', // Static for now, can be dynamic if user data is available
            messages: chat.messages.map((msg, msgIndex) => ({
              id: msgIndex + 1,
              text: msg.text,
              sender: msg.Sender,
            })),
            date: new Date(chat.updatedAt).toLocaleDateString(),
          }));
          setConversations(formattedConversations);
        } else if (data && data._id) {
          // Handle single chat case
          const formattedConversations = [{
            id: data._id,
            sender: 'ChatBot',
            messages: data.messages.map((msg, msgIndex) => ({
              id: msgIndex + 1,
              text: msg.text,
              sender: msg.Sender,
            })),
            date: new Date(data.updatedAt).toLocaleDateString(),
          }];
          setConversations(formattedConversations);
        }
      } catch (err) {
        console.error('Error fetching chats:', err);
      }
    };
    fetchChats();
  }, []);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const handleAddMessage = async (text) => {
    if (!selectedConversation) return;

    try {
      const response = await fetch('http://localhost:5000/api/chat/add-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          text,
          sender: 'user',
        }),
      });
      const data = await response.json();
      if (data.success) {
        const updatedConversations = conversations.map(conv => {
          if (conv.id === selectedConversationId) {
            return {
              ...conv,
              messages: [
                ...conv.messages,
                {
                  id: conv.messages.length + 1,
                  text: data.chat.messages[data.chat.messages.length - 1].text,
                  sender: 'user',
                },
              ],
              date: new Date(data.chat.updatedAt).toLocaleDateString(),
            };
          }
          return conv;
        });
        setConversations(updatedConversations);
      }
    } catch (err) {
      console.error('Error adding message:', err);
    }
  };

  return (
    <div className={styles.mainDashboard}>
      <div className={styles.dashNav}>
        <DashboardNav />
      </div>
      <div className={styles.dashChat}>
        <DashboardChats 
          conversations={conversations} 
          onMessageClick={(conv) => setSelectedConversationId(conv.id)} 
        />
      </div>
      <div className={styles.dashMsgView}>
        <Dashboard_MessageView 
          message={selectedConversation} 
          onSendMessage={handleAddMessage} 
        />
      </div>
    </div>
  );
};

export default MainDashboard;