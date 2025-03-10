import React, { useState, useRef, useEffect } from 'react';
import { getDisasterResponse } from '../../services/getDisasterResponseService';
import { Search, Send, Globe, Loader, AlertTriangle, PhoneCall, MapPin } from 'lucide-react';
import QuickQuestionsSlider from '../../components/QuickQuestionSlider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import NavigationBar from '../../utils/Navbar';

const DisasterAI = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('english');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Add emergency contacts state
  const emergencyContacts = {
    english: [
      { name: 'Emergency Services', number: '119' },
      { name: 'Disaster Management Center', number: '117' },
      { name: 'Ambulance', number: '1990' }
    ],
    'සිංහල': [
      { name: 'හදිසි සේවා', number: '119' },
      { name: 'ආපදා කළමනාකරණ මධ්‍යස්ථානය', number: '117' },
      { name: 'ගිලන් රථ', number: '1990' }
    ],
    'தமிழ்': [
      { name: 'அவசர சேவைகள்', number: '119' },
      { name: 'அனர்த்த முகாமைத்துவ நிலையம்', number: '117' },
      { name: 'அவசர ஊர்தி', number: '1990' }
    ]
  };

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage = {
      type: 'ai',
      content: getWelcomeMessage(language),
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, [language]);

  const getWelcomeMessage = (lang) => {
    const messages = {
        english: `**Welcome to the Disaster Response Assistant**\n\n1. **How to Ask Questions**: You can ask questions in English, Sinhala, or Tamil, and the chatbot will respond accordingly.\n\n2. **Emergency Contacts**: Save these numbers:\n   - Emergency Services: 119\n   - Disaster Management: 117\n   - Ambulance: 1990\n\n3. **Quick Access**: Use the question slider below to get immediate information about floods, landslides, and droughts.\n\nHow can I assist you today?`,

        'සිංහල': `**ආපදා ප්‍රතිචාර සහායකයා වෙත සාදරයෙන් පිළිගනිමු**\n\n1. **ප්‍රශ්න අසන ආකාරය**: ඔබට ප්‍රශ්න සිංහල, ඉංග්‍රීසි හෝ දෙමළ භාෂාවෙන් අසන්නාට හැකි අතර, chatbot එකට එම භාෂාවෙන් පිළිතුරු දිය හැක.\n\n2. **හදිසි ඇමතුම්**: මෙම අංක සුරකින්න:\n   - හදිසි සේවා: 119\n   - ආපදා කළමනාකරණය: 117\n   - ගිලන් රථ: 1990\n\n3. **ක්ෂණික ප්‍රවේශය**: ගංවතුර, නායයෑම් සහ නියඟය පිළිබඳ වහා තොරතුරු ලබා ගැනීමට පහත ප්‍රශ්න ස්ලයිඩරය භාවිතා කරන්න.\n\nමට අද ඔබට කෙසේ උපකාර කළ හැකිද?`,

        'தமிழ்': `**பேரிடர் பதில் உதவியாளருக்கு வரவேற்கிறோம்**\n\n1. **எப்படி கேள்வி கேட்கலாம்**: நீங்கள் ஆங்கிலம், தமிழ் அல்லது சிங்கள மொழியில் கேள்விகளை கேட்கலாம், மற்றும் chatbot அதற்கு அதே மொழியில் பதிலளிக்கும்.\n\n2. **அவசர தொடர்புகள்**: இந்த எண்களை சேமிக்கவும்:\n   - அவசர சேவைகள்: 119\n   - பேரிடர் மேலாண்மை: 117\n   - ஆம்புலன்ஸ்: 1990\n\n3. **விரைவு அணுகல்**: வெள்ளம், மண்சரிவு மற்றும் வறட்சி பற்றிய உடனடி தகவல்களுக்கு கீழே உள்ள கேள்வி ஸ்லைடரைப் பயன்படுத்தவும்.\n\nநான் இன்று உங்களுக்கு எவ்வாறு உதவ முடியும்?`
    };
    return messages[lang] || messages.english;
};



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLanguageChange = () => {
    const languageMap = {
      english: 'සිංහල',
      'සිංහල': 'தமிழ்',
      'தமிழ்': 'english'
    };
    setLanguage(prev => languageMap[prev] || 'english');
  };

  const formatMessage = (content) => {
    if (!content) return '';

    const parts = content.split(/(\d+\.\s*\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
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
      
      const textParts = part.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={index}>
          {textParts.map((text, i) => (
            i % 2 === 0 ? text : <strong key={i}>{text}</strong>
          ))}
        </span>
      );
    });
  };

  const handleQuickQuestionSelect = (question) => {
    setInput(question);
    handleSubmit({ preventDefault: () => {} });
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
      <NavigationBar/>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Emergency Contacts Card */}
        <div className="bg-orange-50 p-4 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <PhoneCall className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-orange-800">
              {language === 'english' ? 'Emergency Contacts' :
               language === 'සිංහල' ? 'හදිසි ඇමතුම්' :
               'அவசர தொடர்புகள்'}
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {emergencyContacts[language].map((contact, index) => (
              <div key={index} className="bg-white p-2 rounded-md text-center">
                <div className="font-semibold text-orange-700">{contact.name}</div>
                <div className="text-orange-600">{contact.number}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
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

          <QuickQuestionsSlider 
            language={language}
            onQuestionSelect={handleQuickQuestionSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default DisasterAI;