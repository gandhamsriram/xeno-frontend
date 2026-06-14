import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Database,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Lightbulb
} from 'lucide-react';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am your Claude-powered XenoCRM Growth Strategist. I have analyzed your shopper database, segment filters, and recent campaigns. Ask me how to optimize your audience conversions, draft compelling copywriting, or suggest new targeting segments!"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // CRM context data
  const [crmContext, setCrmContext] = useState({
    customerCount: 0,
    segments: [],
    recentCampaigns: []
  });
  const [showContext, setShowContext] = useState(false);
  const messagesEndRef = useRef(null);

  // Load CRM context on mount
  useEffect(() => {
    const fetchCrmContext = async () => {
      try {
        const [custRes, segRes, campRes] = await Promise.all([
          API.get('/customers?limit=1'),
          API.get('/segments'),
          API.get('/campaigns')
        ]);

        const customerCount = custRes.data.pagination.total || 0;
        
        const segments = segRes.data.map(s => ({
          name: s.name,
          audienceSize: s.audienceSize,
          rules: s.rules
        }));

        const recentCampaigns = campRes.data.slice(0, 5).map(c => ({
          name: c.name,
          channel: c.channel,
          status: c.status,
          stats: c.stats
        }));

        setCrmContext({ customerCount, segments, recentCampaigns });
      } catch (err) {
        console.error('Failed to load CRM context for AI Assistant:', err);
      }
    };

    fetchCrmContext();
  }, []);

  // Scroll chat window to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMessage = { role: 'user', content: inputText };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);

    try {
      // API request to Chat
      const res = await API.post('/ai/chat', {
        messages: updatedMessages,
        context: crmContext
      });

      setMessages([...updatedMessages, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages([
        ...updatedMessages, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error processing that request: ' + (err.response?.data?.error || err.message) 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col justify-between animate-fadeIn pb-4">
      {/* Header */}
      <div className="flex justify-between items-start shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            AI Marketing Strategist
            <span className="text-xs bg-purple-550/15 text-crmAccent border border-purple-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <BrainCircuit className="w-3 h-3" /> Claude Sonnet 3.5
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Converse with Claude about insights, campaign templates, and growth ideas</p>
        </div>

        {/* Database Context Indicator toggler */}
        <button
          onClick={() => setShowContext(!showContext)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-crmCard border border-gray-800 text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-850 transition-all duration-200"
        >
          <Database className="w-4 h-4 text-purple-400" />
          CRM Context Shared
          {showContext ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* CRM Context Info Card */}
      {showContext && (
        <div className="bg-gray-900/40 p-5 rounded-2xl border border-gray-800 space-y-4 shrink-0 animate-slideDown text-xs text-gray-400">
          <div className="flex items-center gap-2 font-bold text-white border-b border-gray-850 pb-2">
            <Database className="w-4 h-4 text-crmAccent" />
            Active Schema Context injected into System Prompt:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-gray-500 block uppercase font-bold text-[9px] tracking-wider mb-1">Audience Size</span>
              <span className="text-white font-extrabold text-sm">{crmContext.customerCount.toLocaleString()} Shoppers</span>
            </div>
            <div>
              <span className="text-gray-500 block uppercase font-bold text-[9px] tracking-wider mb-1">Configured Segments ({crmContext.segments.length})</span>
              <div className="space-y-1 mt-1 max-h-20 overflow-y-auto pr-1">
                {crmContext.segments.map((s, i) => (
                  <div key={i} className="text-gray-300 font-medium truncate">{s.name} ({s.audienceSize} matched)</div>
                ))}
              </div>
            </div>
            <div>
              <span className="text-gray-500 block uppercase font-bold text-[9px] tracking-wider mb-1">Outreach History ({crmContext.recentCampaigns.length})</span>
              <div className="space-y-1 mt-1 max-h-20 overflow-y-auto pr-1">
                {crmContext.recentCampaigns.map((c, i) => (
                  <div key={i} className="text-gray-300 font-medium truncate capitalize">{c.name} · {c.channel} ({c.status})</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Stream Window */}
      <div className="flex-1 bg-crmCard rounded-2xl border border-gray-800 overflow-hidden flex flex-col justify-between min-h-0 shadow-xl">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, index) => {
            const isAI = msg.role === 'assistant';
            return (
              <div key={index} className={`flex gap-4 ${isAI ? 'justify-start' : 'justify-end'}`}>
                {/* Avatar Icon */}
                {isAI && (
                  <div className="w-9 h-9 rounded-xl bg-crmAccent/15 text-crmAccent flex items-center justify-center border border-crmAccent/25 shrink-0 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                )}
                
                {/* Bubble content */}
                <div className={`max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed border shadow-sm ${
                  isAI
                    ? 'bg-gray-900/40 border-gray-850 text-gray-300 rounded-tl-none'
                    : 'bg-crmAccent border-crmAccent text-white rounded-tr-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {!isAI && (
                  <div className="w-9 h-9 rounded-xl bg-purple-550 flex items-center justify-center text-white font-extrabold text-sm uppercase shrink-0">
                    ME
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Loader */}
          {loading && (
            <div className="flex gap-4 justify-start">
              <div className="w-9 h-9 rounded-xl bg-crmAccent/15 text-crmAccent flex items-center justify-center border border-crmAccent/25 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-gray-900/40 border border-gray-850 rounded-2xl p-4 text-sm text-gray-500 rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-crmAccent" />
                Claude is analyzing and typing...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 bg-gray-900/30 flex gap-4 items-center">
          <input
            type="text"
            placeholder="Ask anything, e.g. 'Draft a WhatsApp discount message for Mumbai segment'..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            className="flex-1 bg-gray-950 border border-gray-850 focus:border-crmAccent focus:ring-1 focus:ring-purple-500/20 rounded-xl py-3.5 px-5 text-sm text-white outline-none placeholder-gray-600 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="p-3.5 bg-crmAccent hover:bg-purple-650 disabled:opacity-30 text-white rounded-xl shadow-lg shadow-purple-500/10 transition-colors shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
