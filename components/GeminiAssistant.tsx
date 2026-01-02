
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Booking, Room } from '../types';
import { Sparkles, Send, Loader2, Bot, HelpCircle } from 'lucide-react';

interface Props {
  bookings: Booking[];
  rooms: Room[];
}

const GeminiAssistant: React.FC<Props> = ({ bookings, rooms }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: '안녕하세요! 게스트하우스 AI 비서입니다. 예약 현황 분석, 가격 최적화 제안, 게스트 응대 메시지 작성 등을 도와드릴 수 있습니다. 무엇을 도와드릴까요?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setIsLoading(true);

    try {
      // Corrected Initialization according to guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = `
        현재 게스트하우스 데이터:
        객실: ${JSON.stringify(rooms)}
        예약: ${JSON.stringify(bookings)}
        
        시스템 역할: 당신은 숙련된 게스트하우스 관리자입니다. 제공된 데이터를 바탕으로 사용자의 질문에 친절하고 전문적으로 답하세요. 답변은 간결하면서도 유용한 정보를 포함해야 하며, 한국어로 작성하세요.
      `;

      // Corrected generateContent call according to guidelines
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${context}\n\n사용자 질문: ${userMsg}`,
      });

      // Using .text property directly (not as a function)
      setMessages(prev => [...prev, { role: 'ai', text: response.text || '죄송합니다. 답변을 생성할 수 없습니다.' }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: 'AI 서비스 연결 중 오류가 발생했습니다.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "다음 주 예약 현황 요약해줘",
    "어떤 객실이 가장 수익이 좋아?",
    "체크인 환영 인사말 써줘",
    "예약률을 높이려면 어떻게 할까?"
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 bg-indigo-600 text-white flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="font-bold">AI 컨시어지</h3>
          <p className="text-[10px] opacity-80 uppercase tracking-wider font-bold">Gemini 기반 서비스</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
              {msg.role === 'ai' && <Bot size={16} className="mb-2 text-indigo-600" />}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl p-4 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-indigo-600" />
              <span className="text-xs text-slate-500 font-medium">Gemini가 생각 중입니다...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((s, idx) => (
            <button 
              key={idx}
              onClick={() => setQuery(s)}
              className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-indigo-500 hover:text-indigo-600 transition-all font-medium text-slate-600 shadow-sm"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative">
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="게스트하우스 운영에 대해 궁금한 점을 물어보세요..."
            className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-2 text-[10px] text-center text-slate-400 font-medium flex items-center justify-center gap-1">
          <HelpCircle size={10} /> AI 답변은 데이터에 기반하며 참고용으로 활용해 주세요.
        </div>
      </div>
    </div>
  );
};

export default GeminiAssistant;
