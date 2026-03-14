
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../context/authStore';
import { ChatWindow } from '../components/ChatWindow';
import { ConversationList } from '../components/ConversationList';
import { apiService } from '../services/api';
import '../styles/ChatDashboard.css';

interface Conversation {
  user_id: string;
  email: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface ChatDashboardProps {
  guestMode?: boolean;
  onLogout?: () => void;
}

export const ChatDashboard: React.FC<ChatDashboardProps> = ({ guestMode, onLogout }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (guestMode) {
      // Optionally fetch public conversations for guests
      setConversations([]); // Or fetch public data if available
      return;
    }
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/messages/conversations');
        setConversations(response.data.conversations || []);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [guestMode]);

  const conversationData = conversations.map(conv => ({
    id: conv.user_id,
    email: conv.email,
    lastMessage: conv.last_message || 'No messages yet',
    lastMessageTime: conv.last_message_time || new Date().toISOString(),
    unreadCount: conv.unread_count || 0,
  }));

  return (
    <div className="chat-dashboard">
      <header className="chat-header">
        <h1>Chat</h1>
        <div className="header-actions">
          <span className="user-info">{guestMode ? 'Guest' : user?.email}</span>
          {guestMode ? (
            <button onClick={onLogout} className="logout-btn">Logout</button>
          ) : (
            <button onClick={logout} className="logout-btn">Logout</button>
          )}
        </div>
      </header>

      <div className="chat-container">
        <aside className="conversation-sidebar">
          {loading ? (
            <div className="loading">Loading conversations...</div>
          ) : (
            <ConversationList
              conversations={conversationData}
              selectedUserId={selectedUserId}
              onSelectConversation={setSelectedUserId}
            />
          )}
        </aside>

        <main className="chat-main">
          {selectedUserId ? (
            <ChatWindow userId={selectedUserId} guestMode={guestMode} />
          ) : (
            <div className="no-conversation">
              <p>{guestMode ? 'Browse public areas as a guest.' : 'Select a conversation to start chatting'}</p>
            </div>
          )}
        </main>
      </div>
      {guestMode && (
        <div className="guest-restrictions">
          <p style={{ color: '#dc3545', textAlign: 'center', marginTop: 16 }}>
            Guest users cannot send messages, add friends, or increase trust score.
          </p>
        </div>
      )}
    </div>
  );
};
