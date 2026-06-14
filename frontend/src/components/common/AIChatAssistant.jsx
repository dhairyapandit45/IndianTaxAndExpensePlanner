import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send } from 'lucide-react';

const AIChatAssistant = ({ expenses }) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your AI Expense Assistant. Ask me anything about your spending!" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);

    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error: No API key found in the environment configuration." }]);
      return;
    }

    setIsLoading(true);

    try {
      const systemInstruction = `
You are a helpful, friendly conversational AI assistant embedded in a Tax & Expense Manager app.
You can converse normally with the user about any topic.
If the user asks questions about their expenses or finances, you MUST use the following real-time JSON data representing their logged expenses to answer them accurately.

CURRENT EXPENSES JSON DATA:
${JSON.stringify(expenses, null, 2)}

Be concise, friendly, and format numbers nicely (e.g. ₹1,000).
      `.trim();

      const groqMessages = [
        { role: "system", content: systemInstruction },
        ...messages.slice(1).map(msg => ({
          role: msg.role === 'ai' ? 'assistant' : 'user',
          content: msg.text
        })),
        { role: "user", content: userText }
      ];

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: groqMessages,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Failed to fetch from Groq');
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);

    } catch (err) {
      console.error(err);
      if (err.message?.includes('API key')) {
         setMessages(prev => [...prev, { role: 'ai', text: "Error: Your configured Groq API Key appears to be invalid or expired." }]);
      } else {
         setMessages(prev => [...prev, { role: 'ai', text: `Sorry, I encountered an error communicating with the AI service: ${err.message}` }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 border border-indigo-100 dark:border-slate-700 p-4 rounded-lg shadow-sm flex flex-col h-[500px]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-100 dark:border-slate-700/50 pb-3 mb-3 shrink-0">
        <h3 className="font-bold text-md text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
          <Sparkles className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400" />
          AI Expense Assistant
        </h3>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-3 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-2.5 text-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-800 dark:text-slate-200 rounded-bl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg rounded-bl-none p-3 shadow-sm flex gap-1">
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="relative shrink-0 mt-auto">
        <input 
          type="text" 
          placeholder="Ask about your expenses..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
          className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-full text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed transition"
        />
        <button 
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="absolute right-1.5 top-1.5 bottom-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white w-7 rounded-full flex items-center justify-center transition">
          <Send className="w-3.5 h-3.5 -ml-0.5" />
        </button>
      </form>

    </div>
  );
};

export default AIChatAssistant;
