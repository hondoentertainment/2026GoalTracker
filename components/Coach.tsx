
import React, { useState, useRef, useEffect } from 'react';
import { getCoachResponse } from '../services/geminiService';
import { Send, User, Bot, Loader2 } from 'lucide-react';

const Coach: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'coach'; text: string }[]>([
    { role: 'coach', text: "Ready to execute the 2026 blueprint. What's on your mind today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const response = await getCoachResponse(userMsg);
    setMessages(prev => [...prev, { role: 'coach', text: response || "No response." }]);
    setLoading(false);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col h-[500px] overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
        <h3 className="font-bold flex items-center space-x-2">
          <Bot size={18} className="text-blue-400" />
          <span>Blueprint Assistant</span>
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase tracking-widest">Powered by Gemini</span>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-tl-none p-4 text-sm border border-slate-700 flex items-center space-x-2">
              <Loader2 className="animate-spin" size={16} />
              <span>Analyzing blueprint...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for creative ideas, tech help, or motivation..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-500"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Coach;
