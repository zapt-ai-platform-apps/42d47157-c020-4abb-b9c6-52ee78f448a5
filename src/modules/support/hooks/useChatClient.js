import { useState } from 'react';
import { StreamChat } from 'stream-chat';
import { useAuthContext } from '@/modules/auth';
import * as Sentry from '@sentry/browser';
import { supabase } from '@/supabaseClient';

const useChatClient = () => {
  const { user } = useAuthContext();
  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connectChat = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      if (!user?.email) {
        console.error('No user email available for chat connection.');
        setError('You must be logged in to use customer support.');
        return;
      }
      
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error('No active session found');
        setError('Authentication error. Please log in again.');
        return;
      }
      
      // Call our backend API to get Stream chat credentials
      console.log('Fetching customer support credentials for:', user.email);
      const response = await fetch('/api/customerSupport', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ email: user.email }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch customer support data (${response.status})`);
      }
      
      const { token, channelId, userId, STREAM_KEY } = await response.json();
      console.log('Received Stream chat credentials for channel:', channelId);
      
      if (!token || !channelId || !userId || !STREAM_KEY) {
        throw new Error('Incomplete customer support data returned from server');
      }
      
      // Initialize StreamChat client
      const streamClient = StreamChat.getInstance(STREAM_KEY);
      
      // Connect user to Stream
      await streamClient.connectUser(
        { 
          id: userId, 
          name: user.email,
          email: user.email 
        },
        token
      );
      
      console.log('Connected to Stream Chat as user:', userId);
      
      // Create and watch channel
      const streamChannel = streamClient.channel('messaging', channelId, {
        name: 'Customer Support',
        members: [userId]
      });
      
      await streamChannel.watch();
      console.log('Watching support channel:', channelId);
      
      setClient(streamClient);
      setChannel(streamChannel);
      
    } catch (error) {
      console.error('Error initializing chat:', error);
      setError(error.message || 'Failed to connect to customer support.');
      Sentry.captureException(error, {
        extra: { 
          action: 'connectChat',
          userEmail: user?.email 
        }
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectChat = async () => {
    if (client) {
      try {
        console.log('Disconnecting from Stream Chat');
        await client.disconnectUser();
        setClient(null);
        setChannel(null);
      } catch (error) {
        console.error('Error disconnecting chat:', error);
        Sentry.captureException(error, {
          extra: {
            action: 'disconnectChat',
            userEmail: user?.email
          }
        });
      }
    }
  };

  return { 
    client, 
    channel, 
    connectChat, 
    disconnectChat, 
    isConnecting,
    error
  };
};

export default useChatClient;