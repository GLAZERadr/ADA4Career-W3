'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AidaChatbotProps {
  className?: string;
}

export default function AidaChatbot({ className = '' }: AidaChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm AIDA, your AI Career Assistant. I can help you with job search tips, interview preparation, resume advice, and career guidance. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const callOpenAI = async (userMessage: string): Promise<string> => {
    // Simulate API delay for realistic experience
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Dummy responses based on common career-related keywords
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
      return "Great question about resumes! Here are some key tips for creating an effective CV:\n\n• Start with a strong professional summary that highlights your unique value proposition\n• Use clear, concise bullet points to describe your achievements with specific metrics when possible\n• Tailor your resume for each job application by matching relevant keywords from the job description\n• Include any accessibility accommodations or assistive technologies you're proficient with as valuable skills\n\nRemember, your diverse perspective and problem-solving abilities are valuable assets to employers!";
    }

    if (lowerMessage.includes('interview')) {
      return "Interview preparation is crucial for success! Here's how to excel:\n\n• Research the company's values, recent news, and accessibility policies\n• Prepare specific examples using the STAR method (Situation, Task, Action, Result)\n• Practice discussing any accommodations you might need in a positive, solution-focused way\n• Prepare thoughtful questions about the role, team dynamics, and growth opportunities\n\nConfidence comes from preparation, and your unique experiences bring valuable insights to any team!";
    }

    if (lowerMessage.includes('job search') || lowerMessage.includes('finding work')) {
      return "Job searching can be challenging, but you've got this! Here's a strategic approach:\n\n• Leverage both traditional job boards and specialized platforms that focus on inclusive hiring\n• Network actively through professional associations, LinkedIn, and industry events\n• Consider reaching out directly to companies you admire with a compelling cover letter\n• Use your network to find internal referrals - many jobs are filled through connections\n\nYour determination and unique perspective are exactly what forward-thinking employers are looking for!";
    }

    if (lowerMessage.includes('accommodation') || lowerMessage.includes('disability') || lowerMessage.includes('accessibility')) {
      return "Discussing workplace accommodations shows professionalism and self-advocacy! Here's how to approach it:\n\n• Focus on your abilities and how accommodations help you perform at your best\n• Be specific about what you need and how it enables your productivity\n• Emphasize that many accommodations benefit all employees (like flexible schedules or ergonomic equipment)\n• Know your rights under disability employment laws in your region\n\nRemember, the right employer will see accommodations as a small investment in a talented team member!";
    }

    if (lowerMessage.includes('skill') || lowerMessage.includes('learning') || lowerMessage.includes('development')) {
      return "Continuous learning is key to career growth! Here are some strategies:\n\n• Identify skills that are in high demand in your field through job postings and industry reports\n• Take advantage of free online courses, webinars, and certification programs\n• Consider learning accessibility-related skills - they're increasingly valuable across industries\n• Join professional communities where you can learn from peers and mentors\n\nYour commitment to growth and diverse perspective make you a valuable lifelong learner!";
    }

    if (lowerMessage.includes('confidence') || lowerMessage.includes('nervous') || lowerMessage.includes('anxiety')) {
      return "Building confidence is a journey, and you're already on the right path by seeking advice! Here's how to boost your confidence:\n\n• Celebrate your achievements regularly - keep a 'wins' journal to reference before interviews\n• Practice your elevator pitch and common interview questions with trusted friends or mentors\n• Remember that your unique experiences and perspectives are valuable assets\n• Focus on what you bring to the table rather than what you think you lack\n\nEvery expert was once a beginner. Your journey and resilience are part of your strength!";
    }

    // Default helpful response
    return "Thank you for reaching out! I'm here to help with your career journey. Whether you're looking for advice on job searching, resume writing, interview preparation, or workplace accommodations, I'm here to support you.\n\nWhat specific aspect of your career development would you like to focus on today? I can provide tailored advice for job seekers, including those who may need workplace accommodations.\n\nRemember, your unique perspective and experiences are valuable assets in today's inclusive workplace!";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await callOpenAI(userMessage.text);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={toggleChat}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300 hover:scale-105"
          aria-label="Open AIDA Career Assistant chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        <div className="absolute -top-2 -right-2">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card className={`w-80 h-96 shadow-xl transition-all duration-300 ${isMinimized ? 'h-14' : 'h-96'}`}>
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" aria-hidden="true"></div>
              AIDA
            </CardTitle>
            <div className="flex gap-1">
              <Button
                onClick={toggleMinimize}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                onClick={toggleChat}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                aria-label="Close chat"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {!isMinimized && (
            <p className="text-xs text-blue-100">Your AI Career Assistant</p>
          )}
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        message.isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>AIDA is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask AIDA about your career..."
                  disabled={isLoading}
                  className="flex-1"
                  aria-label="Type your message to AIDA"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  size="sm"
                  className="px-3"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}