import React from 'react';
import '../styles/ConversationList.css';

interface Conversation {
  id: string;
  email: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedUserId: string | null;
  onSelectConversation: (userId: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedUserId,
  onSelectConversation,
}) => {
  return (
    <div className="conversation-list">
      <div className="conversation-header">
        <input
          type="text"
          placeholder="Search conversations..."
          className="search-input"
        />
      </div>
      <div className="conversations">
        {conversations.length === 0 ? (
          <div className="empty-state">No conversations yet</div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${
                selectedUserId === conv.id ? 'active' : ''
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="conversation-avatar">
                {conv.email.charAt(0).toUpperCase()}
              </div>
              <div className="conversation-info">
                <div className="conversation-name">{conv.email}</div>
                <div className="conversation-preview">{conv.lastMessage}</div>
              </div>
              {conv.unreadCount > 0 && (
                <div className="unread-badge">{conv.unreadCount}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
