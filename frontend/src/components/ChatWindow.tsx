import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useEncryption } from '../hooks/useEncryption';
import { useAuthStore } from '../context/authStore';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import '../styles/ChatWindow.css';

interface Message {
  id: string;
  sender_id: string;
  encrypted_message: string;
  status: 'sent' | 'delivered' | 'seen';
  created_at: string;
}

interface ChatWindowProps {
  userId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();
  const { encryptMessage, decryptMessage } = useEncryption();
  const { accessToken } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation history
  useEffect(() => {
    const loadConversation = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/messages/conversation/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Failed to load conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId && accessToken) {
      loadConversation();
    }
  }, [userId, accessToken]);

  useEffect(() => {
    if (!socket) return;

    socket.on('message_received', async (message: any) => {
      if (message.sender_id === userId) {
        try {
          const decrypted = await decryptMessage(
            message.encrypted_message,
            message.iv
          );
          setMessages((prev) => [
            ...prev,
            { ...message, encrypted_message: decrypted },
          ]);
          scrollToBottom();
          socket.emit('message_seen', { receiver_id: message.sender_id, messageIds: [message.id] });
        } catch (error) {
          console.error('Failed to decrypt message:', error);
        }
      }
    });

    socket.on('message_sent', (message: any) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    socket.on('user_typing', (data: any) => {
      if (data.userId === userId) {
        setIsTyping(true);
      }
    });

    socket.on('user_stopped_typing', (data: any) => {
      if (data.userId === userId) {
        setIsTyping(false);
      }
    });

    socket.on('user_online', (data: any) => {
      if (data.userId === userId) {
        setIsOnline(true);
      }
    });

    socket.on('user_offline', (data: any) => {
      if (data.userId === userId) {
        setIsOnline(false);
      }
    });

    return () => {
      socket.off('message_received');
      socket.off('message_sent');
      socket.off('user_typing');
      socket.off('user_stopped_typing');
      socket.off('user_online');
      socket.off('user_offline');
    };
  }, [socket, userId, decryptMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text: string) => {
    if (!socket) return;

    const { encrypted, iv } = await encryptMessage(text, userId);
    socket.emit('send_message', {
      receiver_id: userId,
      encrypted_message: encrypted,
      iv,
    });
  };

  const handleTyping = () => {
    socket?.emit('typing_start', { receiver_id: userId });
  };

  const handleStopTyping = () => {
    socket?.emit('typing_stop', { receiver_id: userId });
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>Chat</h2>
        <div className="status-indicator">
          <span className={`online-badge ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
      <MessageList messages={messages} ref={messagesEndRef} />
      {isTyping && <div className="typing-indicator">User is typing...</div>}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
      />
    </div>
  );
};
