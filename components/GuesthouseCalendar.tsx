
import React, { useState } from 'react';
import { Room, Booking, BookingStatus } from '../types';
import { User, CheckCircle2, Clock, CalendarDays, Plus, Users } from 'lucide-react';

interface Props {
  rooms: Room[];
  bookings: Booking[];
  startDate: Date;
  onEditBooking: (booking: Booking) => void;
  onQuickBook: (roomId: string, date: Date) => void;
}

const GuesthouseCalendar: React.FC<Props> = ({ rooms, bookings, startDate, onEditBooking, onQuickBook }) => {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  const toLocalISOString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const days = Array.from({ length: 31 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d;
  });

  const getDayLabel = (date: Date) => {
    return date.toLocaleDateString('ko-KR', { weekday: 'short' });
  };

  const getDayNumber = (date: Date) => {
    return date.getDate();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const getBookingsByDay = (roomId: string, date: Date) => {
    const dateStr = toLocalISOString(date);
    const dayBookings = bookings.filter(b => b.roomId === roomId && dateStr >= b.startDate && dateStr < b.endDate);
    
    return {
      all: dayBookings,
      isCheckingIn: dayBookings.find(b => b.startDate === dateStr),
      isCheckingOut: dayBookings.find(b => b.endDate === dateStr),
    };
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED: return <CheckCircle2 size={16} className="text-green-700 font-black" />;
      case BookingStatus.CHECKED_IN: return <User size={16} className="text-blue-700 font-black" />;
      case BookingStatus.PENDING: return <Clock size={16} className="text-amber-700 font-black" />;
      default: return null;
    }
  };

  const getStatusStyles = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return 'opacity-65 saturate-100 border-dashed border-slate-400/60';
      case BookingStatus.CONFIRMED:
        return 'opacity-90 saturate-125 border-solid border-slate-500/30 shadow-lg';
      case BookingStatus.CHECKED_IN:
        return 'opacity-100 saturate-[2.0] border-solid border-2 border-white/50 ring-2 ring-indigo-500/20 shadow-xl scale-[1.02] z-30';
      case BookingStatus.CHECKED_OUT:
        return 'opacity-100 brightness-75 contrast-150 saturate-150 shadow-inner border-slate-800/20';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="flex-1 overflow-auto scrollbar-thin relative">
        <div className="min-w-max relative">
          <div className="flex border-b border-slate-100 bg-slate-50 sticky top-0 z-40">
            <div className="w-56 flex-shrink-0 p-6 font-black text-slate-400 text-[12px] tracking-widest uppercase border-r border-slate-200 sticky left-0 bg-slate-50 z-50 flex items-center justify-center">
              ROOM NAME
            </div>
            <div className="flex-1 flex divide-x divide-slate-200">
              {days.map((day, idx) => (
                <div key={idx} className={`w-16 flex-shrink-0 flex flex-col items-center justify-center py-4 ${isToday(day) ? 'bg-indigo-50 text-indigo-700' : ''}`}>
                  <span className={`text-[11px] font-black uppercase mb-1 ${isWeekend(day) ? 'text-rose-400' : 'text-slate-400'}`}>
                    {getDayLabel(day)}
                  </span>
                  <span className={`text-lg font-black ${isToday(day) ? 'bg-indigo-600 text-white w-9 h-9 flex items-center justify-center rounded-xl shadow-md' : 'text-slate-700'}`}>
                    {getDayNumber(day)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            {rooms.map((room) => (
              <div key={room.id} className="flex border-b border-slate-100 hover:bg-slate-50 group min-h-[110px]">
                <div 
                  className="w-56 flex-shrink-0 p-6 border-r border-slate-200 flex flex-col justify-center sticky left-0 bg-white group-hover:bg-slate-50 z-30 cursor-help"
                  onMouseEnter={() => setHoveredRoom(room.id)}
                  onMouseLeave={() => setHoveredRoom(null)}
                >
                  <span className="font-black text-slate-900 text-lg truncate leading-tight">{room.name}</span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] px-2 py-0.5 bg-slate-200 rounded-lg text-slate-700 font-black uppercase">{room.type}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-bold"><Users size={12} /> {room.baseCapacity}~{room.capacity}인</span>
                  </div>

                  {hoveredRoom === room.id && (
                    <div className="absolute left-full ml-4 top-2 w-80 p-6 bg-slate-900 text-white rounded-[24px] shadow-2xl z-50 animate-in fade-in slide-in-from-left-4 duration-200 border border-slate-700">
                      <h4 className="font-black text-base mb-3">{room.name} 상세 정보</h4>
                      <p className="text-sm text-slate-300 mb-4 leading-relaxed font-medium">{room.description || '상세 설명 없음'}</p>
                      <div className="space-y-2.5 border-t border-slate-700 pt-4 text-xs font-bold">
                        <div className="flex justify-between"><span className="text-slate-400">기준/최대 인원</span><span>{room.baseCapacity}/{room.capacity}명</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">추가 요금(1인)</span><span>${room.extraPersonPrice.toLocaleString()}</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-400">1박 요금</span><span className="text-indigo-300 text-lg font-black">${room.price.toLocaleString()}</span></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex divide-x divide-slate-100 relative bg-white group-hover:bg-slate-50">
                  {days.map((day, idx) => {
                    const status = getBookingsByDay(room.id, day);
                    const isOccupied = status.isCheckingIn || bookings.find(b => b.roomId === room.id && toLocalISOString(day) >= b.startDate && toLocalISOString(day) < b.endDate);

                    return (
                      <div key={idx} className="w-16 h-full relative group/cell flex items-center justify-center transition-colors" onClick={() => !isOccupied && onQuickBook(room.id, day)}>
                        {!isOccupied && (
                          <div className="absolute inset-0 opacity-0 group-hover/cell:opacity-100 flex items-center justify-center cursor-pointer bg-indigo-50/50 transition-opacity z-10">
                            <Plus size={20} className="text-indigo-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {bookings.filter(b => b.roomId === room.id).map(booking => {
                    const start = new Date(booking.startDate);
                    const end = new Date(booking.endDate);
                    const startDiff = (start.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
                    const duration = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
                    if (startDiff + duration < 0 || startDiff > 31) return null;

                    const barLeft = (startDiff * 4) + 1.25; // 4rem per day (w-16)
                    const barWidth = duration * 4;

                    return (
                      <div 
                        key={booking.id}
                        onClick={(e) => { e.stopPropagation(); onEditBooking(booking); }}
                        className={`absolute inset-y-5 z-20 rounded-xl px-4 cursor-pointer border-2 transition-all hover:scale-[1.03] overflow-hidden flex flex-col justify-center ${room.color} ${getStatusStyles(booking.status)}`}
                        style={{ left: `${barLeft}rem`, width: `${barWidth}rem` }}
                      >
                        <div className="flex items-center justify-between gap-2 overflow-hidden">
                          <span className="text-sm font-black truncate leading-none">
                            {booking.guestName} 
                            <span className="text-[11px] opacity-80 ml-2">({booking.guestCount}인)</span>
                          </span>
                          <div className="flex-shrink-0 bg-white/30 rounded-lg p-1">{getStatusIcon(booking.status)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuesthouseCalendar;
