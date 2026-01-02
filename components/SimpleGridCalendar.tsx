
import React, { useState } from 'react';
import { Room, Booking, BookingStatus } from '../types';
import { User } from 'lucide-react';

interface Props {
  rooms: Room[];
  bookings: Booking[];
  currentDate: Date;
}

const SimpleGridCalendar: React.FC<Props> = ({ rooms, bookings, currentDate }) => {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const toLocalISOString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const firstDayOfMonth = new Date(year, month, 1);
  const calendarStart = new Date(firstDayOfMonth);
  calendarStart.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(calendarStart);
    d.setDate(calendarStart.getDate() + i);
    return d;
  });

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const getBookingStatesForDay = (roomId: string, date: Date) => {
    const dateStr = toLocalISOString(date);
    
    return bookings
      .filter(b => b.roomId === roomId && dateStr >= b.startDate && dateStr <= b.endDate)
      .map(b => ({
        booking: b,
        isStart: dateStr === b.startDate,
        isEnd: dateStr === b.endDate
      }));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  const getDurationText = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const nights = Math.ceil((e.getTime() - s.getTime()) / (1000 * 3600 * 24));
    return `${nights}박 ${nights + 1}일`;
  };

  // 상태별 스타일 강도(진하기) 계산 함수 - 고대비 조정
  const getStatusIntensity = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        // 대기: 60% 투명도
        return 'opacity-60 saturate-100 border border-black/10';
      case BookingStatus.CONFIRMED:
        // 확정: 85% 투명도
        return 'opacity-85 border border-black/5';
      case BookingStatus.CHECKED_IN:
        // 체크인: 100% 진하게, 채도 강화
        return 'opacity-100 saturate-[1.8] ring-1 ring-inset ring-black/20';
      case BookingStatus.CHECKED_OUT:
        // 체크아웃: 아주 어둡게
        return 'opacity-100 brightness-[0.65] contrast-125 saturate-150';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full animate-in fade-in duration-500">
      <div className="grid grid-cols-[160px_repeat(7,1fr)] border-b border-slate-200 bg-slate-100/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="py-4 px-4 text-[11px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200 flex items-center justify-center bg-slate-50/90">
          Rooms
        </div>
        {weekDays.map((wd, i) => (
          <div key={wd} className={`py-4 text-center text-[11px] font-black uppercase tracking-widest ${i === 0 ? 'text-rose-600' : i === 6 ? 'text-indigo-600' : 'text-slate-500'}`}>
            {wd}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin divide-y divide-slate-100">
        {Array.from({ length: 6 }).map((_, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-[160px_repeat(7,1fr)] divide-x divide-slate-100 min-h-[160px]">
            <div className="bg-slate-50/20 flex flex-col pt-10 pb-2 border-r border-slate-200 sticky left-0 z-20 shadow-[4px_0_8px_rgba(0,0,0,0.02)]">
              {rooms.map(room => (
                <div 
                  key={room.id} 
                  className="h-[24px] flex items-center px-3 mb-1 relative cursor-help"
                  onMouseEnter={() => setHoveredRoom(`${weekIdx}-${room.id}`)}
                  onMouseLeave={() => setHoveredRoom(null)}
                >
                  <span className="text-[10px] font-bold text-slate-700 truncate w-full text-right pr-2">
                    {room.name}
                  </span>

                  {hoveredRoom === `${weekIdx}-${room.id}` && (
                    <div className="absolute left-full ml-2 top-0 w-64 p-4 bg-slate-900 text-white rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-left-2 duration-200 border border-slate-700 pointer-events-none">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-sm">{room.name} 상세 정보</h4>
                      </div>
                      <p className="text-xs text-slate-300 mb-3 leading-relaxed">{room.description || '상세 설명이 등록되지 않았습니다.'}</p>
                      <div className="space-y-1.5 border-t border-slate-700 pt-3 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">위치</span>
                          <span className="font-semibold text-indigo-300">{room.building || '-'} {room.roomNumber || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">1박 요금</span>
                          <span className="font-semibold text-indigo-300">₩{room.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">최대 인원</span>
                          <span className="font-semibold text-indigo-300">{room.capacity}명</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {calendarDays.slice(weekIdx * 7, (weekIdx + 1) * 7).map((day, idx) => (
              <div 
                key={idx} 
                className={`p-1.5 flex flex-col gap-1 transition-colors ${!isCurrentMonth(day) ? 'bg-slate-50/30 opacity-40' : 'bg-white'} ${isToday(day) ? 'bg-indigo-50/20' : ''}`}
              >
                <div className="flex justify-between items-start px-1 h-[32px]">
                  <span className={`text-[12px] font-bold w-7 h-7 flex items-center justify-center rounded-full transition-all ${isToday(day) ? 'bg-indigo-600 text-white shadow-lg' : (day.getDay() === 0 ? 'text-rose-500' : day.getDay() === 6 ? 'text-indigo-500' : 'text-slate-600')}`}>
                    {day.getDate()}
                  </span>
                  {isToday(day) && (
                    <span className="text-[8px] font-black text-indigo-600 bg-indigo-100/50 px-1.5 py-0.5 rounded uppercase tracking-tighter mt-1">
                      Today
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 flex-1">
                  {rooms.map(room => {
                    const states = getBookingStatesForDay(room.id, day);
                    
                    return (
                      <div key={room.id} className="h-[24px] relative w-full group">
                        <div className="absolute inset-x-0 bottom-0 border-b border-slate-100/50 opacity-40"></div>

                        {states.map(({ booking, isStart, isEnd }, bIdx) => {
                          let width = '100%';
                          let left = '0';
                          let rounded = 'rounded-sm';
                          let showName = true;

                          if (isStart && !isEnd) {
                            width = '50%';
                            left = '50%';
                            rounded = 'rounded-l-none rounded-r-sm';
                          } else if (!isStart && isEnd) {
                            width = '50%';
                            left = '0';
                            rounded = 'rounded-r-none rounded-l-sm';
                            showName = false;
                          } else if (isStart && isEnd) {
                            width = '40%';
                            left = '30%';
                            rounded = 'rounded-full';
                          }

                          const colorParts = room.color.split(' ');
                          const bgColor = colorParts[0];
                          const textColor = colorParts[2];

                          return (
                            <div 
                              key={booking.id}
                              className={`absolute h-[20px] top-[2px] shadow-sm flex items-center px-1 overflow-hidden transition-all ${bgColor} ${textColor} ${rounded} ${getStatusIntensity(booking.status)}`}
                              style={{ width, left, zIndex: isStart ? 10 : 5 }}
                              title={`${booking.guestName} (${getDurationText(booking.startDate, booking.endDate)})`}
                            >
                              {showName && (
                                <span className="text-[9px] font-black truncate leading-none drop-shadow-sm select-none">
                                  {width === '100%' ? booking.guestName : booking.guestName[0]}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="px-8 py-4 border-t border-slate-200 bg-slate-100/50 flex items-center justify-between text-[11px] text-slate-600 font-black uppercase tracking-tight">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-slate-200 border-2 border-dashed border-slate-400"></div> 대기 중
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-slate-300 border-2 border-slate-400"></div> 확정
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-indigo-500 border-2 border-white shadow-sm"></div> 체크인
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-slate-700 border-2 border-slate-800 shadow-inner"></div> 체크아웃
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-500 italic font-bold">
          {"* 색깔 진하기: 대기 < 확정 < 체크인 < 체크아웃 (어두움)"}
        </div>
      </div>
    </div>
  );
};

export default SimpleGridCalendar;
