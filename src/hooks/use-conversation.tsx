import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useQueryState } from 'nuqs';
import React from 'react';

import { client } from '@/components/layout/query-provider';

import { API_AI_URL } from '@/constant/config';

// Define TypeScript interfaces for our data structures
interface Conversation {
  id: string;
  email: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface Message {
  id: string;
  conversation_id: string;
  email: string;
  content: string;
  is_user: boolean;
  timestamp: string;
}

interface ChatResponse {
  conversation: Conversation;
  messages: Message[];
}

interface StartConversationRequest {
  email: string;
  message: string;
  title: string | null;
}

interface AddMessageRequest {
  email: string;
  message: string;
}

// API functions
const api = {
  // Start a new conversation
  startConversation: async (
    payload: StartConversationRequest
  ): Promise<ChatResponse> => {
    const response = await axios.post<ChatResponse>(
      `${API_AI_URL}/conversations`,
      payload
    );
    return response.data;
  },

  // Add a message to an existing conversation
  addMessage: async (
    conversationId: string,
    payload: AddMessageRequest
  ): Promise<ChatResponse> => {
    const response = await axios.post<ChatResponse>(
      `${API_AI_URL}/conversations/${conversationId}/messages`,
      payload
    );
    return response.data;
  },

  // // Get a conversation with all its messages
  // getConversation: async (conversationId: string): Promise<ChatResponse> => {
  //   const response = await axios.get<ChatResponse>(
  //     `${API_BASE_URL}/conversations/${conversationId}`
  //   );
  //   return response.data;
  // },

  // // Get all conversations (for listing/selecting)
  // getConversations: async (email: string): Promise<Conversation[]> => {
  //   const response = await axios.get<Conversation[]>(
  //     `${API_BASE_URL}/conversations?email=${email}`
  //   );
  //   return response.data;
  // },
};

// Custom hook to handle the complete chat functionality
export const useChatConversation = (userEmail: string) => {
  // Use nuqs to store the conversation ID in the URL
  const [conversationId, setConversationId] = useQueryState('conversationId');
  const [conversationTitle, setConversationTitle] =
    useQueryState('conversationTitle');

  const [messages, setMessages] = React.useState<Message[]>([]);

  // Query to fetch existing conversation if conversationId exists
  // const conversationQuery = useQuery({
  //   queryKey: ['conversation', conversationId],
  //   queryFn: async () => {
  //     if (!conversationId) return null;
  //     return api.getConversation(conversationId);
  //   },
  //   enabled: !!conversationId,
  // });

  // // Query to fetch all user conversations for selection
  // const conversationsQuery = useQuery({
  //   queryKey: ['conversations', userEmail],
  //   queryFn: async () => api.getConversations(userEmail),
  //   enabled: !!userEmail,
  // });

  // Mutation to start a new conversation
  const startConversationMutation = useMutation({
    mutationFn: api.startConversation,
    onSuccess: (data) => {
      // Store conversation ID using nuqs when successfully created
      setConversationId(data.conversation.id);
      setConversationTitle(data.conversation.title);
      // Update the cache with the new conversation data
      setMessages(data.messages);
      client.setQueryData(['conversation', data.conversation.id], data);
      // Invalidate the conversations list to include the new one
      client.invalidateQueries({ queryKey: ['conversations', userEmail] });
    },
  });

  // Mutation to add a message to an existing conversation
  const addMessageMutation = useMutation({
    mutationFn: ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: string;
    }) => api.addMessage(conversationId, { email: userEmail, message }),
    onSuccess: (data) => {
      // Update the cache with the updated conversation data
      setMessages(data.messages);
      client.setQueryData(['conversation', data.conversation.id], data);
    },
  });

  // Function to start a new conversation
  const startConversation = (message: string, title: string | null = null) => {
    startConversationMutation.mutate({
      email: userEmail,
      message,
      title,
    });
  };

  // Function to send a message to the current conversation
  const sendMessage = (message: string) => {
    if (!conversationId) {
      // If no conversation exists, start a new one
      startConversation(message);
      return;
    }

    // Add message to existing conversation
    addMessageMutation.mutate({ conversationId, message });
  };

  // Function to select an existing conversation
  const selectConversation = (id: string) => {
    setConversationId(id);
  };

  // // Get the current conversation and messages data
  // const currentConversation = conversationQuery.data?.conversation;
  // const messages = conversationQuery.data?.messages || [];

  // Determine loading and error states across all operations
  const isPending =
    // conversationQuery.isPending ||
    startConversationMutation.isPending || addMessageMutation.isPending;

  const error =
    // conversationQuery.error ||
    startConversationMutation.error || addMessageMutation.error;

  // Return all relevant data and functions
  return {
    // Current conversation data
    // conversation: currentConversation,
    // messages,
    conversationId,

    // All conversations for selection
    // conversations: conversationsQuery.data || [],

    // Action functions
    startConversation,
    sendMessage,
    selectConversation,

    messages,

    // Status
    isPending,
    error,

    // Specific loading states if needed
    isStartingConversation: startConversationMutation.isPending,
    isSendingMessage: addMessageMutation.isPending,
    // isLoadingConversation: conversationQuery.isPending,
    // isLoadingConversations: conversationsQuery.isPending,
  };
};
