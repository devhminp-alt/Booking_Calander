
import React, { useState, useMemo } from 'react';
import { Booking, Room, BookingStatus } from '../types';
import { ClipboardCheck, X, UserCheck, Clock, CheckCircle2, BarChart3, TrendingUp, ListOrdered, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

interface Props {
  bookings: Booking[];
  rooms: Room[];
  selectedDate: Date;
  onEditBooking: (booking: Booking) => void;
}

type KpiType = 'total' | 'pending' | 'confirmed' | 'checked_in' | null;
type FilterType = 'month' | 'all';

const DashboardStats: React.FC<Props> = ({ bookings, rooms, selectedDate, onEditBooking }) => {
  const [activeKpi, setActiveKpi] = useState<KpiType>(null);
  const [filterType, setFilterType] = useState<FilterType>('month');

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const displayMonthLabel = useMemo(() => {
    return selectedDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
  }, [selectedDate]);

  const displayBookings = useMemo(() => {
    if (filterType === 'all') return bookings;
    return bookings.filter(b => b.startDate.startsWith(currentMonthStr) || b.endDate.startsWith(currentMonthStr));
  }, [bookings, currentMonthStr, filterType]);

  const stats = useMemo(() => {
    return {
      total: displayBookings.length,
      pending: displayBookings.filter(b => b.status === BookingStatus.PENDING).length,
      confirmed: displayBookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
      checkedIn: displayBookings.filter(b => b.status === BookingStatus.CHECKED_IN).length,
    };
  }, [displayBookings]);

  const occupancyData = useMemo(() => {
    const rangeStart = new Date(year, month, 1);
    const rangeEnd = new Date(year, month + 1, 0);
    const totalDays = filterType === 'month' ? daysInMonth : 365;

    return rooms.map(room => {
      const roomBookings = bookings.filter(b => b.roomId === room.id && b.status !== BookingStatus.CANCELLED);
      let occupiedNights = 0;
      roomBookings.forEach(b => {
        const bStart = new Date(b.startDate);
        const bEnd = new Date(b.endDate);
        if (filterType === 'month') {
          const overlapStart = bStart < rangeStart ? rangeStart : bStart;
          const overlapEnd = bEnd > rangeEnd ? rangeEnd : bEnd;
          const diff = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 3600 * 24));
          if (diff > 0) occupiedNights += diff;
        } else {
          occupiedNights += Math.ceil((bEnd.getTime() - bStart.getTime()) / (1000 * 3600 * 24));
        }
      });
      const rate = filterType === 'month' ? Math.min(100, Math.round((occupiedNights / totalDays) * 100)) : occupiedNights;
      return { name: room.name, value: rate, color: room.color };
    });
  }, [rooms, bookings, filterType, year, month, daysInMonth]);

  const activeBookingList = useMemo(() => {
    if (!activeKpi) return [];
    if (activeKpi === 'total') return displayBookings;
    if (activeKpi === 'pending') return displayBookings.filter(b => b.status === BookingStatus.PENDING);
    if (activeKpi === 'confirmed') return displayBookings.filter(b => b.status === BookingStatus.CONFIRMED);
    if (activeKpi === 'checked_in') return displayBookings.filter(b => b.status === BookingStatus.CHECKED_IN);
    return [];
  }, [activeKpi, displayBookings]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 inline-flex">
          <button onClick={() => { setFilterType('month'); setActiveKpi(null); }} className={`px-8 py-3 rounded-xl text-sm font-black transition-all uppercase tracking-widest ${filterType === 'month' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>월간 현황</button>
          <button onClick={() => { setFilterType('all'); setActiveKpi(null); }} className={`px-8 py-3 rounded-xl text-sm font-black transition-all uppercase tracking-widest ${filterType === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>전체 현황</button>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">ANALYSIS RANGE</p>
          <p className="text-base font-black text-slate-800">{filterType === 'month' ? `${displayMonthLabel} 기준` : '누적 전체 데이터'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button onClick={() => setActiveKpi('total')} className={`bg-white p-8 rounded-[40px] border-2 transition-all text-left group ${activeKpi === 'total' ? 'ring-8 ring-slate-500/10 border-slate-500 shadow-inner' : 'border-slate-100 hover:border-slate-300 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4"><span className="text-slate-400 text-[11px] font-black uppercase tracking-widest">총 예약 건수</span><ClipboardCheck size={28} className="text-slate-400 group-hover:text-slate-600" /></div>
          <p className="text-5xl font-black text-slate-800">{stats.total}<span className="text-base font-bold text-slate-400 ml-2">건</span></p>
        </button>
        <button onClick={() => setActiveKpi('pending')} className={`bg-white p-8 rounded-[40px] border-2 transition-all text-left group ${activeKpi === 'pending' ? 'ring-8 ring-amber-500/10 border-amber-500 shadow-inner' : 'border-slate-100 hover:border-amber-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4"><span className="text-slate-400 text-[11px] font-black uppercase tracking-widest">예약 대기</span><Clock size={28} className="text-amber-500" /></div>
          <p className="text-5xl font-black text-slate-800">{stats.pending}<span className="text-base font-bold text-slate-400 ml-2">건</span></p>
        </button>
        <button onClick={() => setActiveKpi('confirmed')} className={`bg-white p-8 rounded-[40px] border-2 transition-all text-left group ${activeKpi === 'confirmed' ? 'ring-8 ring-indigo-500/10 border-indigo-500 shadow-inner' : 'border-slate-100 hover:border-indigo-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4"><span className="text-slate-400 text-[11px] font-black uppercase tracking-widest">예약 확정</span><CheckCircle2 size={28} className="text-indigo-600" /></div>
          <p className="text-5xl font-black text-slate-800">{stats.confirmed}<span className="text-base font-bold text-slate-400 ml-2">건</span></p>
        </button>
        <button onClick={() => setActiveKpi('checked_in')} className={`bg-white p-8 rounded-[40px] border-2 transition-all text-left group ${activeKpi === 'checked_in' ? 'ring-8 ring-emerald-500/10 border-emerald-500 shadow-inner' : 'border-slate-100 hover:border-emerald-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4"><span className="text-slate-400 text-[11px] font-black uppercase tracking-widest">입실 중</span><UserCheck size={28} className="text-emerald-600" /></div>
          <p className="text-5xl font-black text-slate-800">{stats.checkedIn}<span className="text-base font-bold text-slate-400 ml-2">팀</span></p>
        </button>
      </div>

      {activeKpi ? (
        <div className="bg-white rounded-[48px] border-2 border-slate-100 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8">
          <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-6">
              <button onClick={() => setActiveKpi(null)} className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-indigo-600 transition-all border-2 border-transparent hover:border-indigo-100 shadow-sm">
                <ArrowLeft size={32} />
              </button>
              <div>
                <h3 className="font-black text-slate-900 text-2xl tracking-tight">
                  {activeKpi === 'pending' ? '예약 대기' : activeKpi === 'checked_in' ? '입실 중' : activeKpi === 'confirmed' ? '예약 확정' : '전체'} 목록
                </h3>
                <p className="text-sm text-slate-400 font-bold mt-1">총 {activeBookingList.length}개의 예약 내역이 있습니다.</p>
              </div>
            </div>
            <button onClick={() => setActiveKpi(null)} className="p-4 hover:bg-slate-200 rounded-[24px] transition-all text-slate-400"><X size={28} /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest bg-white">
                  <th className="px-10 py-6">게스트 정보</th><th className="px-10 py-6">예약 객실</th><th className="px-10 py-6">숙박 기간</th><th className="px-10 py-6">결제 금액</th><th className="px-10 py-6 text-right">진행 상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-base font-bold bg-white">
                {activeBookingList.map(b => {
                  const room = rooms.find(r => r.id === b.roomId);
                  return (
                    <tr key={b.id} onClick={() => onEditBooking(b)} className="hover:bg-indigo-50/50 cursor-pointer transition-colors group">
                      <td className="px-10 py-7 font-black text-slate-900 text-lg">{b.guestName} <span className="text-xs text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg ml-2 border border-indigo-100">({b.guestCount}인)</span></td>
                      <td className="px-10 py-7 text-sm text-slate-600 font-black">{room?.name}</td>
                      <td className="px-10 py-7 text-sm font-bold text-slate-400">{b.startDate} ~ {b.endDate}</td>
                      <td className="px-10 py-7 text-indigo-600 font-black text-lg">$ {b.amount.toLocaleString()}</td>
                      <td className="px-10 py-7 text-right">
                        <span className={`text-xs uppercase font-black px-4 py-2 rounded-xl border shadow-sm ${
                          b.status === BookingStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          b.status === BookingStatus.CHECKED_IN ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          b.status === BookingStatus.CONFIRMED ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm animate-in fade-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <BarChart3 className="text-indigo-600" size={32} /> 
                {filterType === 'month' ? '객실별 점유율 현황 (%)' : '객실별 누적 숙박 실적 (박)'}
              </h3>
              <p className="text-sm text-slate-400 font-black mt-1 uppercase tracking-widest">Business Insights & Analytics</p>
            </div>
            <div className="flex items-center gap-3 bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100">
              <TrendingUp size={24} className="text-indigo-600" />
              <span className="text-sm font-black text-indigo-700">실시간 데이터 분석 완료</span>
            </div>
          </div>
          <div className="h-[450px] w-full px-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#1e293b', fontSize: 14, fontWeight: 900 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13 }} unit={filterType === 'month' ? "%" : "박"} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '32px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '24px' }} />
                <Bar dataKey="value" radius={[16, 16, 0, 0]} barSize={80}>
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value > 80 ? '#4f46e5' : entry.value > 50 ? '#6366f1' : entry.value > 20 ? '#818cf8' : '#c7d2fe'} />
                  ))}
                  <LabelList dataKey="value" position="top" formatter={(v: number) => filterType === 'month' ? `${v}%` : `${v}박`} style={{ fill: '#1e293b', fontSize: 16, fontWeight: 900 }} dy={-10} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;
