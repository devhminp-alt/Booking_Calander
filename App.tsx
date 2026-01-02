
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Users, LayoutDashboard, ChevronLeft, ChevronRight, Settings, Grid3X3, HelpCircle, Database } from 'lucide-react';
import { ROOMS, INITIAL_BOOKINGS, INITIAL_SERVICES } from './constants';
import { Booking, BookingStatus, Room, ServiceDefinition } from './types';
import GuesthouseCalendar from './components/GuesthouseCalendar';
import SimpleGridCalendar from './components/SimpleGridCalendar';
import BookingModal from './components/BookingModal';
import DashboardStats from './components/DashboardStats';
import RoomSettings from './components/RoomSettings';
import HelpGuide from './components/HelpGuide';
import TechnicalSpec from './components/TechnicalSpec';
import { DBOrchestrator } from './dbOrchestrator';

const generateNumericId = () => {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
};

const TEMP_API_PATH = (reservId: string) => {
  console.log(`[API CALL] Initializing new reservation with Temp ReservId: ${reservId}`);
};

const App: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>(ROOMS);
  const [services, setServices] = useState<ServiceDefinition[]>(INITIAL_SERVICES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [view, setView] = useState<'calendar' | 'grid-calendar' | 'dashboard' | 'settings' | 'guide' | 'spec'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Partial<Booking> | undefined>(undefined);
  const [dbPath, setDbPath] = useState<string>("");

  useEffect(() => {
    fetch('/metadata.json')
      .then(res => res.json())
      .then(data => {
        if (!data.DATABASE_PATH) throw new Error("DATABASE_PATH missing in metadata.json");
        setDbPath(data.DATABASE_PATH);
      })
      .catch(err => {
        console.error("Critical Error: Could not load Database Path.", err);
      });
  }, []);

  const handleAddBooking = (preData?: Partial<Booking>) => {
    const tempReservId = generateNumericId();
    TEMP_API_PATH(tempReservId);
    
    setEditingBooking({ 
      ...preData, 
      id: tempReservId,
      status: BookingStatus.PENDING,
      bookedServices: [] 
    });
    setIsModalOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  const handleSaveBooking = (newBooking: Booking) => {
    const isNew = !bookings.find(b => b.id === newBooking.id);
    let processedBooking = { ...newBooking };
    
    if (!processedBooking.invoiceId) {
      processedBooking.invoiceId = generateNumericId();
    }

    const roomData = rooms.find(r => r.id === processedBooking.roomId) || rooms[0];
    DBOrchestrator.syncBooking(processedBooking, isNew, roomData);

    if (!isNew) {
      setBookings(prev => prev.map(b => b.id === processedBooking.id ? processedBooking : b));
    } else {
      setBookings(prev => [...prev, processedBooking]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteBooking = (id: string) => {
    const bookingToDelete = bookings.find(b => b.id === id);
    if (bookingToDelete) {
      DBOrchestrator.deleteBooking(id, bookingToDelete.invoiceId);
      setBookings(prev => prev.filter(b => b.id !== id));
    }
    setIsModalOpen(false);
  };

  const handleAddRoom = (room: Room) => {
    DBOrchestrator.syncRoom(room, true);
    setRooms(prev => [...prev, room]);
  };

  const handleUpdateRoom = (room: Room) => {
    DBOrchestrator.syncRoom(room, false);
    setRooms(prev => prev.map(r => r.id === room.id ? room : r));
  };

  const handleDeleteRoom = (roomId: string) => {
    DBOrchestrator.deleteRoom(roomId);
    setRooms(prev => prev.filter(r => r.id !== roomId));
  };

  const handleUpdateServices = (newServices: ServiceDefinition[]) => {
    DBOrchestrator.syncServicesMaster(newServices);
    setServices(newServices);
  };

  const changeMonth = (months: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + months);
    setSelectedDate(newDate);
  };

  const goToToday = () => setSelectedDate(new Date());

  if (!dbPath) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-rose-100">
          <Database size={48} className="mx-auto text-rose-500 mb-4" />
          <h1 className="text-2xl font-black text-slate-800">Database Connection Error</h1>
          <p className="text-slate-500 mt-2 text-lg">metadata.json에서 DATABASE_PATH를 확인할 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-inter">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Calendar size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-indigo-900 leading-none">StaySync</h1>
          </div>
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">Data Orchestrator</p>
        </div>

        <nav className="flex-1 p-5 space-y-2 overflow-y-auto scrollbar-none">
          <div className="px-3 mb-3">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Persistence Views</p>
          </div>
          <button 
            onClick={() => setView('calendar')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${view === 'calendar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-black' : 'text-slate-600 hover:bg-slate-50 font-bold'}`}
          >
            <Calendar size={22} />
            <span className="text-base">예약 현황 (31일)</span>
          </button>
          <button 
            onClick={() => setView('grid-calendar')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${view === 'grid-calendar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-black' : 'text-slate-600 hover:bg-slate-50 font-bold'}`}
          >
            <Grid3X3 size={22} />
            <span className="text-base">예약 현황 (달력)</span>
          </button>
          
          <div className="px-3 mt-8 mb-3">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Analytics & Log</p>
          </div>
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-black' : 'text-slate-600 hover:bg-slate-50 font-bold'}`}
          >
            <LayoutDashboard size={22} />
            <span className="text-base">대시보드</span>
          </button>
          <button 
            onClick={() => setView('spec')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${view === 'spec' ? 'bg-indigo-50 text-indigo-700 font-black' : 'text-slate-600 hover:bg-slate-50 font-bold'}`}
          >
            <Database size={22} />
            <span className="text-base">SQL 데이터 명세</span>
          </button>

          <div className="px-3 mt-8 mb-3">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Support</p>
          </div>
          <button 
            onClick={() => setView('guide')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${view === 'guide' ? 'bg-indigo-50 text-indigo-700 font-black' : 'text-slate-600 hover:bg-slate-50 font-bold'}`}
          >
            <HelpCircle size={22} />
            <span className="text-base">이용 가이드</span>
          </button>
        </nav>

        <div className="p-5 border-t border-slate-100">
          <button 
            onClick={() => setView('settings')}
            className={`w-full p-6 rounded-[28px] text-left transition-all ${view === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            <h3 className="text-base font-black mb-1">{rooms.length}개 객실 운영 중</h3>
            <p className={`text-[11px] mb-4 uppercase font-black tracking-widest ${view === 'settings' ? 'text-indigo-100' : 'text-slate-400'}`}>Settings & Services</p>
            <div className={`text-xs flex items-center gap-2 font-black ${view === 'settings' ? 'text-white' : 'text-indigo-400'}`}>
              <Settings size={16} /> 환경 설정 바로가기
            </div>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-24 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {view === 'calendar' ? '월간 현황 (Timeline)' : view === 'grid-calendar' ? '월간 현황 (Grid)' : view === 'dashboard' ? '통계 대시보드' : view === 'settings' ? '운영 설정' : view === 'guide' ? '사용 가이드' : view === 'spec' ? 'SQLite Orchestration Spec' : '데이터 관리'}
            </h2>
            {(view === 'calendar' || view === 'grid-calendar' || view === 'dashboard') && (
              <div className="flex items-center gap-4">
                <button onClick={goToToday} className="px-5 py-2.5 text-sm font-black bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm">오늘</button>
                <div className="flex items-center gap-2 bg-slate-100 rounded-2xl p-1.5 shadow-inner">
                  <button onClick={() => changeMonth(-1)} className="p-2.5 hover:bg-white rounded-xl transition-all text-slate-600 shadow-sm"><ChevronLeft size={22} /></button>
                  <span className="text-base font-black px-6 min-w-[180px] text-center text-slate-800">{selectedDate.toLocaleDateString('ko-KR', { month: 'long', year: 'numeric' })}</span>
                  <button onClick={() => changeMonth(1)} className="p-2.5 hover:bg-white rounded-xl transition-all text-slate-600 shadow-sm"><ChevronRight size={22} /></button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex flex-col items-end mr-4">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">Database Connected</span>
              <span className="text-xs font-black text-indigo-600 truncate max-w-[240px]">{dbPath}</span>
            </div>
            <button 
              onClick={() => handleAddBooking()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3.5 rounded-2xl text-base font-black flex items-center gap-3 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              <Plus size={24} />
              <span>새 예약 등록</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 bg-slate-50/50">
          {view === 'calendar' && <GuesthouseCalendar rooms={rooms} bookings={bookings} startDate={selectedDate} onEditBooking={handleEditBooking} onQuickBook={(roomId, date) => handleAddBooking({ roomId, startDate: date.toISOString().split('T')[0] })} />}
          {view === 'grid-calendar' && <SimpleGridCalendar rooms={rooms} bookings={bookings} currentDate={selectedDate} />}
          {view === 'dashboard' && <DashboardStats bookings={bookings} rooms={rooms} selectedDate={selectedDate} onEditBooking={handleEditBooking} />}
          {view === 'spec' && <TechnicalSpec />}
          {view === 'settings' && <RoomSettings rooms={rooms} services={services} onAddRoom={handleAddRoom} onUpdateRoom={handleUpdateRoom} onDeleteRoom={handleDeleteRoom} onUpdateServices={handleUpdateServices} />}
          {view === 'guide' && <HelpGuide />}
        </div>
      </main>

      {isModalOpen && <BookingModal isOpen={isModalOpen} rooms={rooms} services={services} booking={editingBooking as Booking} onSave={handleSaveBooking} onDelete={handleDeleteBooking} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default App;
