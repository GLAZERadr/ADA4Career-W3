'use client';
import { Bot, SendIcon } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

import { useChatConversation } from '@/hooks/use-conversation';

import AdaLogo from '@/components/ada-logo';
import { MemoizedMarkdown } from '@/components/features/job-seeker/memoized-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

import useAuthStore from '@/store/useAuthStore';

const AidaChatPage = () => {
  const { user } = useAuthStore();
  const {
    conversationId,
    // startConversation,
    sendMessage,
    messages,
    // selectConversation,
    isPending,
    error,
  } = useChatConversation(user?.email ?? '');

  // State for the message input
  const [inputMessage, setInputMessage] = React.useState('');

  // Refs for scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage);
    setInputMessage('');
  };

  return (
    <div className='flex flex-col h-full'>
      <ScrollArea className='flex-1 h-full pb-8'>
        <div>
          {messages.length === 0 ? (
            <div className='w-full h-72 flex items-center justify-center text-gray-400 flex-col'>
              <Bot className='h-80 w-80' />
              <h3 className='font-medium'>Start Chatting with AIDA</h3>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={index} className='flex items-end gap-1'>
                  {!message.is_user ? (
                    <div className=''>
                      <AdaLogo />
                    </div>
                  ) : null}
                  <div
                    className={`p-4 rounded-lg prose space-y-2 mb-2 ${
                      message.is_user
                        ? 'bg-blue-500 text-white ml-auto'
                        : 'bg-gray-100 text-black'
                    }`}
                  >
                    <MemoizedMarkdown
                      content={message.content}
                      id={message.id}
                    />
                  </div>
                </div>
              ))}
              {/* This empty div is used as a reference for scrolling to the bottom */}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </ScrollArea>
      <form
        onSubmit={handleSubmit}
        className='h-14 p-2 w-full rounded-lg border-2 flex gap-2 group focus-within:border-blue-500'
      >
        <Input
          className='h-full !border-none focus-visible:ring-0 !focus:outline-none !focus:border-none !outline-none shadow-none'
          placeholder='Ask something...'
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button
          className='h-full'
          onClick={handleSubmit}
          disabled={isPending}
          type='submit'
        >
          {isPending ? 'Sending...' : 'Send'}
          <SendIcon className='ml-2' />
        </Button>
      </form>
    </div>
  );
};

export default AidaChatPage;
