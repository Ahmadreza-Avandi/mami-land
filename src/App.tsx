import React, { useRef, useEffect } from 'react';
import { useChat } from './hooks/useChat';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { EmptyState } from './components/EmptyState';
import { ErrorMessage } from './components/ErrorMessage';

function App() {
  const { messages, isLoading, error, sendMessage, clearChat, clearError, userProfile, onboardingStep } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSampleClick = (message: string) => {
    sendMessage(message);
  };

  const isOnboarding = onboardingStep < 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50" dir="rtl">
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <ChatHeader 
          onClearChat={clearChat} 
          messageCount={messages.length}
          userProfile={userProfile}
        />

        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
          <div className="h-[600px] flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <ErrorMessage message={error} onClose={clearError} />
              )}
              
              {messages.length === 0 ? (
                <EmptyState 
                  onSampleClick={handleSampleClick} 
                  isOnboarding={isOnboarding}
                  userProfile={userProfile}
                />
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-pink-200 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="bg-white border border-pink-100 rounded-2xl rounded-bl-md px-4 py-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 pt-0">
              <ChatInput 
                onSendMessage={sendMessage}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          تماممی حقوق مطعلق به مامی لند میباشد
        </p>
      </div>
    </div>
  );
}

export default App;