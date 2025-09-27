'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import AdaLogo from '@/components/ada-logo';

interface Message {
  id: string;
  content: string;
  is_user: boolean;
  timestamp: Date;
}

const AidaChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm AIDA, your AI Career Assistant. I can help you with job search tips, interview preparation, resume advice, and career guidance. How can I assist you today?",
      is_user: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIDAResponse = async (userMessage: string): Promise<string> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_APIKEY;

      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are AIDA, an AI Career Assistant for ADA4Career platform, specifically designed to help job seekers with disabilities. Your role is to provide helpful, encouraging, and practical career advice.

Key guidelines:
- Be supportive, empathetic, and encouraging
- Focus on practical career advice and job search tips
- Consider accessibility needs and inclusive workplace practices
- Provide specific, actionable suggestions
- Keep responses concise but helpful (2-3 paragraphs max)
- Emphasize the user's strengths and potential
- Suggest relevant resources when appropriate

Topics you can help with:
- Resume and CV writing tips
- Interview preparation and accessibility accommodations
- Job search strategies
- Career development and skill building
- Workplace rights and accommodations
- Building confidence and overcoming barriers
- Networking and professional relationships
- Web3 and blockchain career opportunities

Always maintain a positive, professional tone while being genuinely helpful.`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';
    } catch (error: any) {
      console.error('OpenAI API Error:', error);

      if (error.message?.includes('API key')) {
        return 'I\'m having trouble connecting to my AI service. Please check that the API configuration is correct.';
      } else if (error.message?.includes('quota') || error.message?.includes('billing')) {
        return 'I\'m temporarily unavailable due to service limits. Please try again later.';
      } else if (error.message?.includes('rate limit')) {
        return 'I\'m receiving too many requests right now. Please wait a moment and try again.';
      } else {
        return 'I\'m experiencing some technical difficulties. Please try rephrasing your question or try again in a moment.';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      is_user: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIDAResponse(userMessage.content);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        is_user: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error. Please try again.',
        is_user: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 h-full pb-8">
        <div>
          {messages.length === 1 ? (
            <div className="w-full h-72 flex items-center justify-center text-gray-400 flex-col">
              <Bot className="h-80 w-80" />
              <h3 className="font-medium">Start Chatting with AIDA</h3>
            </div>
          ) : null}

          {messages.map((message, index) => (
            <div key={message.id} className="flex items-start gap-3 mb-4">
              {!message.is_user && (
                <div className="flex-shrink-0">
                  <AdaLogo />
                </div>
              )}
              <div
                className={`p-4 rounded-lg max-w-[80%] ${
                  message.is_user
                    ? 'bg-blue-500 text-white ml-auto'
                    : 'bg-gray-100 text-black'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0">
                <AdaLogo />
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AIDA is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSubmit}
        className="h-14 p-2 w-full rounded-lg border-2 flex gap-2 group focus-within:border-blue-500"
      >
        <Input
          className="h-full !border-none focus-visible:ring-0 !focus:outline-none !focus:border-none !outline-none shadow-none"
          placeholder="Ask AIDA about your career..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button
          className="h-full"
          onClick={handleSubmit}
          disabled={isLoading || !inputMessage.trim()}
          type="submit"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Sending...
            </>
          ) : (
            <>
              Send
              <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default AidaChatPage;