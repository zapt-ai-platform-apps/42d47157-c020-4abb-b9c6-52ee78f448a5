import { useState, useCallback } from 'react';
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

  const connectChat = useCallback(async () => {
    // Clear any previous clients/connections to avoid state conflicts
    if (client) {
      try {
        await client.disconnectUser();
      } catch (e) {
        console.warn('Error while disconnecting previous client:', e);
      }
    }
    
    setClient(null);
    setChannel(null);
    
    try {
      setIsConnecting(true);
      setError(null);
      
      if (!user?.email) {
        console.error('No user email available for chat connection.');
        setError('You must be logged in to use customer support.');
        return;
      }
      
      // Get current session for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication error: ' + sessionError.message);
      }
      
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
        const errorText = await response.text();
        let errorMessage;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || `Server error (${response.status})`;
        } catch (e) {
          errorMessage = `Failed to fetch customer support data (${response.status}): ${errorText.substring(0, 100)}`;
        }
        
        console.error('API response error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        console.error('Failed to parse API response as JSON:', e);
        throw new Error('Invalid response format from server');
      }
      
      const { token, channelId, userId, STREAM_KEY } = responseData;
      
      console.log('Received Stream chat credentials:', {
        hasToken: !!token,
        channelId,
        userId,
        hasStreamKey: !!STREAM_KEY
      });
      
      if (!token) {
        throw new Error('Missing authentication token for chat');
      }
      
      if (!channelId) {
        throw new Error('Missing channel ID for chat');
      }
      
      if (!userId) {
        throw new Error('Missing user ID for chat');
      }
      
      if (!STREAM_KEY) {
        throw new Error('Missing Stream API key');
      }
      
      // Initialize StreamChat client
      const streamClient = StreamChat.getInstance(STREAM_KEY);
      
      // Check if already connected to avoid errors
      if (streamClient.userID) {
        console.log('Client already has a user connected, disconnecting first');
        await streamClient.disconnectUser();
      }
      
      // Connect user to Stream
      console.log('Connecting to Stream as user:', userId);
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
      console.log('Creating channel:', channelId);
      const streamChannel = streamClient.channel('messaging', channelId, {
        name: 'Customer Support',
        members: [userId]
      });
      
      console.log('Watching channel');
      await streamChannel.watch();
      console.log('Successfully watching support channel:', channelId);
      
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
  }, [user, client]);

  const disconnectChat = useCallback(async () => {
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
  }, [client, user]);

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