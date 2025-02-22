import React, { useState, useRef, useEffect } from 'react';
import { getDisasterResponse } from '../../services/getDisasterResponseService';
import { Search, Send, Globe, Loader } from 'lucide-react';

const DisasterAI = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('english');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLanguageChange = () => {
    const languageMap = {
      english: 'සිංහල',
      සිංහල: 'தமிழ்',
      தமிழ்: 'english'
    };
    setLanguage(prev => languageMap[prev] || 'english');
  };

  // Format the message content with proper styling
  const formatMessage = (content) => {
    if (!content) return '';

    // Split by numbered points
    const parts = content.split(/(\d+\.\s*\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
      // Check if this part is a numbered point
      const pointMatch = part.match(/(\d+)\.\s*\*\*(.*?)\*\*(.*)/);
      
      if (pointMatch) {
        const [_, number, boldText, remainingText] = pointMatch;
        return (
          <div key={index} className="mb-4">
            <span className="font-semibold">{number}. </span>
            <span className="font-bold">{boldText}</span>
            {remainingText}
          </div>
        );
      }
      
      // Handle regular bold text
      const parts = part.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={index}>
          {parts.map((text, i) => (
            i % 2 === 0 ? text : <strong key={i}>{text}</strong>
          ))}
        </span>
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { 
      type: 'user', 
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);
    setLoading(true);

    try {
      const result = await getDisasterResponse(userMessage, language);
      if (result && result.success) {
        setMessages(prev => [...prev, { 
          type: 'ai', 
          content: result.response,
          timestamp: new Date().toISOString()
        }]);
      } else {
        throw new Error(result?.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: 'Sorry, there was an error processing your request.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={`${message.timestamp}-${index}`}
            className={`
              p-4 rounded-lg max-w-3xl mx-2 my-2
              ${message.type === 'user' 
                ? 'bg-blue-100 ml-auto' 
                : message.type === 'error'
                ? 'bg-red-100'
                : 'bg-gray-100 mr-auto'
              }
            `}
          >
            <div className={`text-${message.type === 'error' ? 'red' : 'gray'}-800`}>
              {message.type === 'ai' 
                ? formatMessage(message.content)
                : message.content
              }
            </div>
          </div>
        ))}
        {loading && (
          <div className="bg-gray-100 p-4 rounded-lg max-w-3xl mx-2">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLanguageChange}
              className="p-2 hover:bg-gray-100 rounded-full"
              title={`Current language: ${language}`}
            >
              <Globe className="w-5 h-5 text-gray-500" />
              <span className="sr-only">Change language</span>
            </button>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  language === 'english' ? "Ask about disaster response..." :
                  language === 'සිංහල' ? "ආපදා ප්‍රතිචාර ගැන විමසන්න..." :
                  "பேரழிவு பதில் பற்றி கேளுங்கள்..."
                }
                className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-blue-300"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
            >
              {loading ? (
                <Loader className="w-5 h-5 text-gray-500 animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DisasterAI;