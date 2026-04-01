import { useState, useRef, useEffect } from 'react';
import NavBar from '../../components/shared/NavBar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const SUGGESTIONS = ['What is a fraction?','How do I multiply?','What do plants need to grow?','Tell me a fun science fact!','How does rain happen?','What is the largest planet?'];

export default function ChildChatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role:'assistant', content:`Hi ${user?.name?.split(' ')[0]||'there'}! 👋 I'm Buddy. Ask me anything about your lessons — Math, Science, Hindi, English, or anything you're curious about!` }
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  async function sendMessage(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg = { role:'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const history = [...messages, userMsg].slice(-10);
      const { data } = await api.post('/ai/chat', { messages: history });
      setMessages(prev => [...prev, { role:'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role:'assistant', content:'Oops! Something went wrong. Please try again 🙏' }]);
    } finally { setLoading(false); }
  }

  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content flex flex-col" style={{height:'calc(100vh - 0px)', maxWidth:640, margin:'0 auto'}}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-[#D85A30] shrink-0">
          <div className="w-10 h-10 rounded-full bg-[#993C1D] flex items-center justify-center text-xl shrink-0">🤖</div>
          <div>
            <p className="text-white font-black text-base" style={{fontFamily:'Nunito,sans-serif'}}>Buddy</p>
            <p className="text-[#F5C4B3] text-xs">Your learning helper · Always here!</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-gray-50 dark:bg-gray-950">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role==='user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-[#FAECE7] dark:bg-[#712B13]/40 flex items-center justify-center text-sm shrink-0">🤖</div>
              )}
              <div className={`max-w-[78%] px-4 py-2.5 text-sm leading-relaxed rounded-2xl font-medium ${
                msg.role === 'user'
                  ? 'bg-[#E6F1FB] dark:bg-[#185FA5]/20 text-[#042C53] dark:text-[#85B7EB] rounded-br-sm'
                  : 'bg-[#FAECE7] dark:bg-[#712B13]/20 text-[#4A1B0C] dark:text-[#F0997B] rounded-bl-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-[#FAECE7] dark:bg-[#712B13]/40 flex items-center justify-center text-sm">🤖</div>
              <div className="bg-[#FAECE7] dark:bg-[#712B13]/20 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-[#D85A30] animate-bounce" style={{animationDelay:`${i*0.15}s`}} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div className="px-4 py-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2 overflow-x-auto shrink-0">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => sendMessage(s)}
              className="shrink-0 border border-[#F0997B] dark:border-[#993C1D] rounded-full px-3 py-1.5 text-xs font-bold text-[#993C1D] dark:text-[#F0997B] bg-transparent hover:bg-[#FAECE7] dark:hover:bg-[#712B13]/20 transition-colors cursor-pointer whitespace-nowrap">
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <input
            className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#D85A30]/30 focus:border-[#D85A30]"
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask Buddy anything…" />
          <button
            onClick={() => sendMessage()} disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-full bg-[#D85A30] text-white flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-[#993C1D] transition-colors cursor-pointer border-none">
            ▶
          </button>
        </div>
      </main>
    </div>
  );
}