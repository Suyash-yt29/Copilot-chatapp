import React, { useState, useRef, useEffect } from 'react';
import '../styles/MessageInput.css';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  onStopTyping,
}) => {
  const [message, setMessage] = useState('');
  const typingRef = useRef<ReturnType<typeof setTimeout>>();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    if (e.target.value.length > 0) {
      onTyping();
      clearTimeout(typingRef.current);
      typingRef.current = setTimeout(onStopTyping, 2000);
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      onStopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(typingRef.current);
    };
  }, []);

  return (
    <div className="message-input-container">
      <textarea
        value={message}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        rows={3}
      />
      <button onClick={handleSend} disabled={!message.trim()}>
        Send
      </button>
    </div>
  );
};
