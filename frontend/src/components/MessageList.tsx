import React, { forwardRef } from 'react';
import '../styles/MessageList.css';

interface Message {
  id: string;
  sender_id: string;
  encrypted_message: string;
  status: 'sent' | 'delivered' | 'seen';
  created_at: string;
  media_url?: string;
}

interface MessageListProps {
  messages: Message[];
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages }, ref) => {
    return (
      <div className="message-list">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-item ${message.status}`}
          >
            <div className="message-content">
              {message.media_url ? (
                message.media_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img src={message.media_url} alt="media" style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8 }} />
                ) : (
                  <a href={message.media_url} target="_blank" rel="noopener noreferrer">Download file</a>
                )
              ) : (
                message.encrypted_message
              )}
            </div>
            <div className="message-meta">
              <span className="timestamp">
                {new Date(message.created_at).toLocaleTimeString()}
              </span>
              <span className="status">{message.status}</span>
            </div>
          </div>
        ))}
        <div ref={ref} />
      </div>
    );
  }
);

MessageList.displayName = 'MessageList';
