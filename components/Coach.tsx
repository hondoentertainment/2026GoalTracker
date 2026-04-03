
import React, { useState, useRef, useEffect } from 'react';
import { getCoachResponse, isCoachAvailable } from '../services/geminiService';
import { getDataSummaryForCoach } from '../services/storageService';
import { Send, User, Bot, Loader2, ChevronDown, ChevronUp, BarChart3, AlertTriangle } from 'lucide-react';

const Coach: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'coach'; text: string }[]>([
    { role: 'coach', text: "Ready to execute the 2026 blueprint. What's on your mind today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [dataSummary, setDataSummary] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setDataSummary(getDataSummaryForCoach());
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const freshSummary = getDataSummaryForCoach();
    setDataSummary(freshSummary);
    const response = await getCoachResponse(userMsg, freshSummary);
    setMessages(prev => [...prev, { role: 'coach', text: response || "No response." }]);
    setLoading(false);
  };

  const summaryLines = dataSummary.trim().split('\n').filter(l => l.trim());

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
        {!isCoachAvailable() && (
          <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <AlertTriangle size={16} className="text-yellow-400 mt-0.5 shrink-0" />
            <div className="text-xs text-yellow-300">
              <p className="font-semibold mb-1">API key not configured</p>
              <p className="text-yellow-400/80">Add <code className="bg-slate-800 px-1 rounded">GEMINI_API_KEY</code> to your <code className="bg-slate-800 px-1 rounded">.env.local</code> file to enable the AI coach.</p>
            </div>
          </div>
        )}
        {/* Current Stats collapsible section */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50">
          <button
            onClick={() => setStatsOpen(prev => !prev)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-slate-400 hover:text-slate-300 transition-colors"
          >
            <span className="flex items-center space-x-2">
              <BarChart3 size={14} className="text-blue-400" />
              <span className="font-medium">Current Stats</span>
              <span className="text-slate-500">&mdash; what the coach sees</span>
            </span>
            {statsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {statsOpen && (
            <div className="px-4 pb-3 pt-1 border-t border-slate-700/50">
              <ul className="space-y-1">
                {summaryLines.map((line, i) => (
                  <li key={i} className="text-xs text-slate-400 leading-relaxed">
                    {line.startsWith('-') ? line : <span className="font-semibold text-slate-300">{line}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

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
