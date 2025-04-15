import { useState } from 'react';
import { StreamChat } from 'stream-chat';
import useAuth from '../../auth/hooks/useAuth';
import * as Sentry from '@sentry/browser';

const useChatClient = () => {
  const { session } = useAuth();
  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);

  const connectChat = async () => {
    try {
      const userEmail = session?.user?.email;
      if (!userEmail) {
        console.error('No user session available for chat connection.');
        return;
      }
      
      const response = await fetch('/api/customerSupport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ email: userEmail }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch customer support data:', errorData);
        throw new Error(`Failed to fetch customer support data: ${errorData.error || response.statusText}`);
      }
      
      const { token, channelId, userId, STREAM_API_KEY } = await response.json();
      
      if (!token || !channelId || !userId || !STREAM_API_KEY) {
        throw new Error('Incomplete customer support data received from server');
      }
      
      console.log('Connecting to Stream Chat with:', {
        userId,
        channelId,
        hasToken: !!token,
        hasStreamKey: !!STREAM_API_KEY
      });
      
      const streamClient = StreamChat.getInstance(STREAM_API_KEY);
      await streamClient.connectUser(
        { id: userId, name: userEmail },
        token
      );
      
      const streamChannel = streamClient.channel('messaging', channelId);
      await streamChannel.watch();
      
      setClient(streamClient);
      setChannel(streamChannel);
      
      console.log('Successfully connected to customer support chat');
    } catch (error) {
      console.error('Error initializing chat:', error);
      Sentry.captureException(error, {
        extra: {
          component: 'useChatClient',
          method: 'connectChat',
          userEmail: session?.user?.email
        }
      });
    }
  };

  const disconnectChat = async () => {
    try {
      if (client) {
        await client.disconnectUser();
        setClient(null);
        setChannel(null);
        console.log('Disconnected from customer support chat');
      }
    } catch (error) {
      console.error('Error disconnecting chat:', error);
      Sentry.captureException(error, {
        extra: {
          component: 'useChatClient',
          method: 'disconnectChat'
        }
      });
    }
  };

  return { client, channel, connectChat, disconnectChat };
};

export default useChatClient;