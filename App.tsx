
import React, { useState } from 'react';
import { Calendar, Plus, Users, LayoutDashboard, MessageSquare, ChevronLeft, ChevronRight, Settings, Grid3X3, HelpCircle } from 'lucide-react';
import { ROOMS, INITIAL_BOOKINGS, INITIAL_SERVICES } from './constants';
import { Booking, BookingStatus, Room, ServiceDefinition } from './types';
import GuesthouseCalendar from './components/GuesthouseCalendar';
import SimpleGridCalendar from './components/SimpleGridCalendar';
import BookingModal from './components/BookingModal';
import DashboardStats from './components/DashboardStats';
import GeminiAssistant from './components/GeminiAssistant';
import RoomSettings from './components/RoomSettings';
import HelpGuide from './components/HelpGuide';

const App: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>(ROOMS);
  const [services, setServices] = useState<ServiceDefinition[]>(INITIAL_SERVICES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [view, setView] = useState<'calendar' | 'grid-calendar' | 'dashboard' | 'assistant' | 'settings' | 'guide'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Partial<Booking> | undefined>(undefined);

  const handleAddBooking = (preData?: Partial<Booking>) => {
    setEditingBooking(preData || { bookedServices: [] });
    setIsModalOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  const handleSaveBooking = (newBooking: Booking) => {
    const exists = bookings.find(b => b.id === newBooking.id);
    if (exists) {
      setBookings(prev => prev.map(b => b.id === newBooking.id ? newBooking : b));
    } else {
      setBookings(prev => [...prev, newBooking]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    setIsModalOpen(false);
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const changeMonth = (months: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + months);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handleAddRoom = (newRoom: Room) => {
    setRooms(prev => [...prev, newRoom]);
  };

  const handleUpdateRoom = (updatedRoom: Room) => {
    setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
  };

  const handleDeleteRoom = (roomId: string) => {
    if (window.confirm('이 객실을 삭제하시겠습니까? 관련 예약 정보는 유지되지만 캘린더에서 보이지 않게 됩니다.')) {
      setRooms(prev => prev.filter(r => r.id !== roomId));
    }
  };

  const handleUpdateServices = (updatedServices: ServiceDefinition[]) => {
    setServices(updatedServices);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-inter">
      {/* 사이드바 */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Calendar size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-indigo-900 leading-none">StaySync</h1>
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Management Platform</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-none">
          <div className="px-3 mb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Views</p>
          </div>
          <button 
            onClick={() => setView('calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'calendar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-bold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}
          >
            <Calendar size={20} />
            <span className="text-sm">예약 현황 (31일)</span>
          </button>
          <button 
            onClick={() => setView('grid-calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'grid-calendar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-bold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}
          >
            <Grid3X3 size={20} />
            <span className="text-sm">예약 현황 (달력)</span>
          </button>
          
          <div className="px-3 mt-6 mb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analysis & Help</p>
          </div>
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}
          >
            <LayoutDashboard size={20} />
            <span className="text-sm">대시보드</span>
          </button>
          <button 
            onClick={() => setView('assistant')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'assistant' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}
          >
            <MessageSquare size={20} />
            <span className="text-sm">AI 비서</span>
          </button>
          <button 
            onClick={() => setView('guide')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'guide' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}
          >
            <HelpCircle size={20} />
            <span className="text-sm">이용 가이드</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setView('settings')}
            className={`w-full p-4 rounded-2xl text-left transition-all ${view === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            <h3 className="text-sm font-bold mb-1">{rooms.length}개 객실 운영 중</h3>
            <p className={`text-[10px] mb-3 uppercase font-black tracking-widest ${view === 'settings' ? 'text-indigo-100' : 'text-slate-400'}`}>Settings & Services</p>
            <div className={`text-[11px] flex items-center gap-1.5 font-bold ${view === 'settings' ? 'text-white' : 'text-indigo-400'}`}>
              <Settings size={14} /> 환경 설정 바로가기
            </div>
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 헤더 */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {view === 'calendar' ? '월간 현황 (Timeline)' : view === 'grid-calendar' ? '월간 현황 (Grid)' : view === 'dashboard' ? '통계 대시보드' : view === 'settings' ? '운영 설정' : view === 'guide' ? '사용 가이드' : 'AI 컨시어지'}
            </h2>
            {(view === 'calendar' || view === 'grid-calendar' || view === 'dashboard') && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={goToToday}
                  className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                >
                  오늘
                </button>
                <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 shadow-inner">
                  <button 
                    onClick={() => changeMonth(-1)} 
                    className="p-2 hover:bg-white rounded-lg transition-all text-slate-600 shadow-sm"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-bold px-4 min-w-[140px] text-center text-slate-700">
                    {selectedDate.toLocaleDateString('ko-KR', { month: 'long', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={() => changeMonth(1)} 
                    className="p-2 hover:bg-white rounded-lg transition-all text-slate-600 shadow-sm"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleAddBooking()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              <Plus size={20} />
              <span>새 예약 등록</span>
            </button>
          </div>
        </header>

        {/* 콘텐츠 영역 */}
        <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
          {view === 'calendar' && (
            <div className="h-full flex flex-col">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Timeline View</h3>
                  <p className="text-xs text-slate-400 font-medium">상세 예약 관리 및 드래그 조회에 최적화되어 있습니다.</p>
                </div>
              </div>
              <GuesthouseCalendar 
                rooms={rooms} 
                bookings={bookings} 
                startDate={selectedDate} 
                onEditBooking={handleEditBooking}
                onQuickBook={(roomId, date) => handleAddBooking({ roomId, startDate: date.toISOString().split('T')[0] })}
              />
            </div>
          )}
          {view === 'grid-calendar' && (
            <div className="h-full flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800">Grid View</h3>
                <p className="text-xs text-slate-400 font-medium">7열 표준 달력 형식으로 월간 흐름을 한눈에 파악합니다.</p>
              </div>
              <SimpleGridCalendar 
                rooms={rooms} 
                bookings={bookings} 
                currentDate={selectedDate} 
              />
            </div>
          )}
          {view === 'dashboard' && (
            <DashboardStats 
              bookings={bookings} 
              rooms={rooms} 
              selectedDate={selectedDate} 
              onEditBooking={handleEditBooking} 
            />
          )}
          {view === 'assistant' && (
            <GeminiAssistant bookings={bookings} rooms={rooms} />
          )}
          {view === 'settings' && (
            <RoomSettings 
              rooms={rooms} 
              services={services}
              onAddRoom={handleAddRoom} 
              onUpdateRoom={handleUpdateRoom}
              onDeleteRoom={handleDeleteRoom}
              onUpdateServices={handleUpdateServices}
            />
          )}
          {view === 'guide' && (
            <HelpGuide />
          )}
        </div>
      </main>

      {/* 모달 */}
      {isModalOpen && (
        <BookingModal 
          isOpen={isModalOpen}
          rooms={rooms}
          services={services}
          booking={editingBooking as Booking}
          onSave={handleSaveBooking}
          onDelete={handleDeleteBooking}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
