'use client';

import { useChat } from '@ai-sdk/react';
import { User, Bot, Send } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function Chat() {

  const { messages, input, handleInputChange, handleSubmit, status } = useChat();


  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-4 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 via-teal-500 to-blue-500 bg-clip-text text-transparent">
            Ai Agent Chatbot
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex justify-center">
        <div className="w-full max-w-4xl flex flex-col">
          {/* Chat container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="flex items-start space-x-2">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-purple-500' : 'bg-green-500'
                    }`}
                >
                  {m.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div
                  className={`flex-grow p-3 rounded-lg shadow-md ${m.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white'
                    : 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-100'
                    }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-t-xl shadow-2xl">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="flex space-x-2">
                <input
                  className="flex-1 p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
                  value={input}
                  placeholder="Type your message..."
                  onChange={handleInputChange}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-md flex items-center justify-center"
                  disabled={status !== 'ready'}
                >
                  {status === 'submitted' || status === 'streaming' ? (
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}