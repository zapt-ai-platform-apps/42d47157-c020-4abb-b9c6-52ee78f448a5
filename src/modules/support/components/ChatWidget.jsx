import React, { useState, useEffect, useRef } from 'react';
import {
  Chat,
  Channel,
  Window,
  MessageList,
  MessageInput,
  Thread,
  ChannelHeader,
  TypingIndicator
} from 'stream-chat-react';
import { useAuthContext } from '@/modules/auth';
import useChatClient from '../hooks/useChatClient';
import 'stream-chat-react/dist/css/v2/index.css';
import * as Sentry from '@sentry/browser';

// Custom loading indicator component
const ChatLoading = () => (
  <div className="flex items-center gap-2">
    <div className="w-5 h-5 border-3 border-t-transparent border-indigo-600 rounded-full animate-spin" />
    <span className="text-sm font-medium text-indigo-600">Connecting...</span>
  </div>
);

// Custom channel header for support chat
const CustomChannelHeader = () => (
  <div className="p-3 border-b border-gray-200 bg-white">
    <div className="flex items-center">
      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Customer Support</h3>
        <p className="text-sm text-gray-500">We usually respond within 24 hours</p>
      </div>
    </div>
  </div>
);

// Error display component
const ErrorDisplay = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center h-full flex flex-col items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    <h3 className="text-red-700 text-lg font-medium mb-2">Connection Error</h3>
    <p className="text-red-600 mb-6 max-w-xs mx-auto">{message}</p>
    <button 
      onClick={onRetry}
      className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors duration-150 cursor-pointer"
    >
      Try Again
    </button>
  </div>
);

// Main chat widget component
const ChatWidget = () => {
  const { user } = useAuthContext();
  const { 
    client, 
    channel, 
    connectChat, 
    disconnectChat, 
    isConnecting,
    error
  } = useChatClient();
  
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const chatContainerRef = useRef(null);
  
  // Track window dimensions for responsive behavior
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle channel message notifications
  useEffect(() => {
    if (channel && !isOpen) {
      const handleNewMessage = (event) => {
        // Only show notification for messages from others
        if (event.user?.id !== client.userID) {
          setUnreadCount((prev) => prev + 1);
          setShowNotification(true);
          
          // Auto-hide notification after 5 seconds
          setTimeout(() => {
            setShowNotification(false);
          }, 5000);
        }
      };

      channel.on('message.new', handleNewMessage);
      return () => {
        channel.off('message.new', handleNewMessage);
      };
    }
  }, [channel, isOpen, client]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (client) {
        disconnectChat();
      }
    };
  }, [disconnectChat, client]);

  // If user is not logged in, don't show the chat widget
  if (!user) {
    return null;
  }

  const handleRetry = () => {
    setConnectionAttempts(prev => prev + 1);
    connectChat();
  };

  const toggleChat = async () => {
    if (!isOpen) {
      try {
        setConnectionAttempts(prev => prev + 1);
        await connectChat();
        setIsOpen(true);
        setUnreadCount(0); // Reset unread count when opening
      } catch (e) {
        console.error('Failed to open chat:', e);
        Sentry.captureException(e, {
          extra: { 
            action: 'toggleChat', 
            opening: true,
            connectionAttempts
          }
        });
      }
    } else {
      setIsOpen(false);
    }
  };

  // Get appropriate chat window dimensions
  const getChatWindowDimensions = () => {
    if (windowWidth < 640) { // Mobile
      return {
        width: 'calc(100vw - 32px)',
        height: '400px',
      };
    } else if (windowWidth < 1024) { // Tablet
      return {
        width: '350px',
        height: '500px',
      };
    } else { // Desktop
      return {
        width: '380px',
        height: '550px',
      };
    }
  };

  const { width, height } = getChatWindowDimensions();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* New message notification */}
      {showNotification && !isOpen && (
        <div 
          className="bg-white rounded-lg p-3 mb-3 shadow-lg border border-indigo-100 animate-slide-up"
          style={{ maxWidth: '250px' }}
        >
          <div className="flex items-start">
            <div className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-800 font-medium">New support message</p>
              <p className="text-gray-600 text-sm">Click to view {unreadCount > 1 ? `(${unreadCount})` : ''}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat widget button */}
      <button
        onClick={toggleChat}
        disabled={isConnecting}
        className={`
          shadow-lg transition-all duration-300 transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          ${isOpen 
            ? 'bg-gray-700 hover:bg-gray-800 text-white rounded-lg px-4 py-2'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white rounded-full w-14 h-14 flex items-center justify-center'
          }
        `}
        aria-label={isOpen ? "Close support chat" : "Open support chat"}
      >
        {isConnecting ? (
          <ChatLoading />
        ) : (
          <>
            {isOpen ? (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Close
              </span>
            ) : (
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div 
          ref={chatContainerRef}
          className="mt-4 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 animate-fade-in"
          style={{ width, height }}
        >
          {error ? (
            <ErrorDisplay 
              message={`${error} (Attempt ${connectionAttempts})`} 
              onRetry={handleRetry}
            />
          ) : (
            client && channel ? (
              <Chat client={client} theme="messaging light">
                <Channel channel={channel}>
                  <Window>
                    <CustomChannelHeader />
                    <MessageList />
                    <MessageInput focus />
                  </Window>
                  <Thread />
                </Channel>
              </Chat>
            ) : (
              <div className="h-full flex items-center justify-center flex-col p-6">
                <div className="w-16 h-16 border-4 border-t-transparent border-indigo-600 rounded-full animate-spin mb-6"></div>
                <p className="text-gray-700 text-center font-medium">Connecting to customer support...</p>
                <p className="text-gray-500 text-center text-sm mt-2">This may take a few moments</p>
              </div>
            )
          )}
        </div>
      )}
      
      {/* Made on ZAPT badge */}
      <div className="fixed bottom-4 left-4 z-10">
        <a 
          href="https://www.zapt.ai" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-indigo-600 transition-colors"
        >
          Made on ZAPT
        </a>
      </div>
    </div>
  );
};

export default ChatWidget;