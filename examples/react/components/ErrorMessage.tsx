import React from 'react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onDismiss, 
  type = 'error' 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  const getClassName = () => {
    return `message message-${type}`;
  };

  return (
    <div className={getClassName()}>
      <div className="message-content">
        <span className="message-icon">{getIcon()}</span>
        <span className="message-text">{message}</span>
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss} 
          className="message-dismiss"
          aria-label="Dismiss message"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
