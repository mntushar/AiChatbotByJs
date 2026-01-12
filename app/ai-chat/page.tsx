'use client';

import { AiChat } from '@/request_handlers/ai_chat';
import { Bot, Send, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function Chat() {
  const requestHandler: AiChat = new AiChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingMessage('');

    try {
      const apiMessages = [...messages, userMessage].map(({ role, content }) => ({
        role,
        content,
      }));

      const completeResponse = await requestHandler.sendMessage(
        apiMessages,
        (content) => {
          setStreamingMessage(content);
        },
        false
      );

      if (completeResponse) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: completeResponse,
          },
        ]);
      }

      setStreamingMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, there was an error processing your message.',
        },
      ]);
      setStreamingMessage('');
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="w-full overflow-y-auto flex flex-col justify-between">
          {/* Chat container */}
          <div className="w-full max-w-4xl p-4 space-y-4 mx-auto flex flex-col flex-grow">
            {messages.map((m) => (
              <div key={m.id} className="flex items-start space-x-2">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'user'
                    ? 'bg-zinc-700'
                    : 'bg-gradient-to-r from-gray-700 to-gray-600'
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
                    ? 'bg-zinc-700 text-white'
                    : 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-100'
                    }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}

            {/* Streaming message */}
            {streamingMessage && (
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-gray-700 to-gray-600">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-grow p-3 rounded-lg shadow-md bg-gradient-to-r from-gray-700 to-gray-600 text-gray-100">
                  <p className="whitespace-pre-wrap">{streamingMessage}</p>
                  <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse"></span>
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && !streamingMessage && (
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-gray-700 to-gray-600">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-grow p-3 rounded-lg shadow-md bg-gradient-to-r from-gray-700 to-gray-600 text-gray-100">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <div className="sticky bottom-0 p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-t-xl shadow-2xl">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="flex space-x-2">
                <input
                  className="flex-1 p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
                  value={input}
                  placeholder="Type your message..."
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? (
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