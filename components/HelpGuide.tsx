
import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  Plus, 
  LayoutDashboard, 
  Settings,
  HelpCircle,
  CheckCircle2,
  Monitor,
  UserPlus
} from 'lucide-react';

const HelpGuide: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "환영합니다! 사장님",
      subtitle: "게스트하우스 관리가 훨씬 쉬워집니다.",
      content: "이 프로그램은 복잡한 장부 대신 컴퓨터로 예약을 한눈에 보고 관리하는 도구입니다. 어렵지 않으니 천천히 따라와 보세요.",
      icon: <Monitor size={80} className="text-indigo-600" />,
      tips: ["왼쪽의 메뉴 버튼들을 누르면 화면이 바뀝니다.", "글자가 큼직큼직하니 편하게 보세요."]
    },
    {
      title: "1단계: 예약 확인하기",
      subtitle: "누가 언제 오는지 한눈에 보세요.",
      content: "'예약 현황' 버튼을 누르면 5개 방의 상태가 달력처럼 펼쳐집니다. 파란색 막대는 이미 예약된 손님입니다.",
      icon: <Calendar size={80} className="text-blue-600" />,
      tips: ["막대를 누르면 손님 이름과 전화번호를 볼 수 있어요.", "오늘 날짜는 보라색으로 표시됩니다."]
    },
    {
      title: "2단계: 새 손님 등록하기",
      subtitle: "파란색 버튼만 기억하세요.",
      content: "화면 오른쪽 위에 있는 '+ 새 예약 등록' 버튼을 누르세요. 손님 이름과 날짜를 입력하고 '저장'을 누르면 끝납니다.",
      icon: <Plus size={80} className="text-emerald-600" />,
      tips: ["실수로 잘못 적었다면 언제든 다시 눌러서 고칠 수 있어요.", "방 번호를 선택하면 가격이 자동으로 계산됩니다."]
    },
    {
      title: "3단계: 돈 계산 (정산)",
      subtitle: "복잡한 계산은 기계가 다 합니다.",
      content: "추가 인원 요금이나 조식 비용을 따로 적을 수 있습니다. 손님이 늘어나면 '인원수'만 바꿔주세요. 합계 금액이 자동으로 뜹니다.",
      icon: <UserPlus size={80} className="text-amber-600" />,
      tips: ["조식은 평일만 계산해주는 기능이 들어있어요.", "현장에서 깎아준 가격도 직접 적어넣을 수 있습니다."]
    },
    {
      title: "4단계: 운영 분석하기",
      subtitle: "우리 집 장사가 잘 되고 있나?",
      content: "'대시보드' 메뉴를 누르면 이번 달에 총 몇 팀이 왔는지, 어떤 방이 인기가 제일 많은지 그래프로 보여줍니다.",
      icon: <LayoutDashboard size={80} className="text-purple-600" />,
      tips: ["숫자를 누르면 그 손님들 명단이 쫙 나옵니다.", "저번 달보다 잘했는지 한눈에 비교해보세요."]
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  return (
    <div className="max-w-4xl mx-auto h-[700px] flex flex-col bg-white rounded-[40px] shadow-2xl border-8 border-slate-100 overflow-hidden relative">
      <div className="flex-1 p-12 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="p-8 bg-slate-50 rounded-[40px] shadow-inner">
          {slides[currentSlide].icon}
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-slate-800 tracking-tight leading-tight">
            {slides[currentSlide].title}
          </h1>
          <h2 className="text-2xl font-bold text-indigo-600 italic">
            {slides[currentSlide].subtitle}
          </h2>
        </div>

        <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-2xl">
          {slides[currentSlide].content}
        </p>

        <div className="w-full max-w-xl grid grid-cols-1 gap-3 mt-4">
          {slides[currentSlide].tips.map((tip, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-emerald-800 font-bold text-lg">
              <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 bg-slate-900 flex items-center justify-between">
        <button 
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xl transition-all ${currentSlide === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-white hover:bg-slate-800'}`}
        >
          <ChevronLeft size={32} />
          이전으로
        </button>

        <div className="flex gap-3">
          {slides.map((_, idx) => (
            <div key={idx} className={`w-4 h-4 rounded-full transition-all ${idx === currentSlide ? 'bg-indigo-400 w-12' : 'bg-slate-700'}`}></div>
          ))}
        </div>

        <button 
          onClick={nextSlide}
          className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-xl transition-all ${currentSlide === slides.length - 1 ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
        >
          {currentSlide === slides.length - 1 ? (
            <>시작하기 <CheckCircle2 size={32} /></>
          ) : (
            <>다음으로 <ChevronRight size={32} /></>
          )}
        </button>
      </div>

      <div className="absolute top-8 right-12 bg-slate-100 px-6 py-2 rounded-full font-black text-slate-400 text-lg">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
};

export default HelpGuide;
