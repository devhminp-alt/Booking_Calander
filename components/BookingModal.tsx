import React, { useState, useEffect, useRef } from 'react';
import { Room, Booking, BookingStatus, ServiceDefinition, BookedService, ServiceType } from '../types';
import { X, Trash2, Save, Calendar, User, Phone, CreditCard, Plus, Minus, Coffee, Edit3, CalendarRange, Clock, UserPlus, CheckCircle2, UserCheck, LogOut, Hash } from 'lucide-react';

interface Props {
  isOpen: boolean;
  rooms: Room[];
  services: ServiceDefinition[];
  booking?: Partial<Booking>;
  onSave: (booking: Booking) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const BookingModal: React.FC<Props> = ({ isOpen, rooms, services, booking, onSave, onDelete, onClose }) => {
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  const toLocalISOString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [customExtraPrice, setCustomExtraPrice] = useState<number>(0);
  const [formData, setFormData] = useState<Partial<Booking>>({
    roomId: rooms[0].id,
    guestName: '',
    guestCount: 1,
    startDate: toLocalISOString(new Date()),
    endDate: toLocalISOString(new Date(Date.now() + 86400000)),
    status: BookingStatus.PENDING,
    amount: 0,
    notes: '',
    guestPhone: '',
    bookedServices: []
  });

  const getDayDiff = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    return Math.max(0, Math.ceil((e.getTime() - s.getTime()) / (1000 * 3600 * 24)));
  };

  const calculateServiceDays = (name: string, start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    let count = 0;

    if (name.includes('공항 픽업')) return 1;

    if (name.includes('주말식사')) {
      let curr = new Date(s);
      while (curr < e) {
        if (curr.getDay() === 6) count++;
        curr.setDate(curr.getDate() + 1);
      }
      return count;
    }

    if (name.includes('출퇴근')) {
      let curr = new Date(s);
      curr.setDate(curr.getDate() + 1);
      while (curr < e) {
        const day = curr.getDay();
        if (day >= 1 && day <= 5) count++; 
        curr.setDate(curr.getDate() + 1);
      }
      return count;
    }

    return getDayDiff(start, end);
  };

  const calculateTotalAmount = (roomId: string, start: string, end: string, guestCount: number, bookedServices: BookedService[], extraPrice: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return 0;
    const nights = getDayDiff(start, end);
    const extraGuests = Math.max(0, guestCount - room.baseCapacity);
    const roomBaseTotal = (room.price + (extraGuests * extraPrice)) * nights;
    const servicesTotal = (bookedServices || []).reduce((acc, s) => acc + s.price, 0);
    return roomBaseTotal + servicesTotal;
  };

  useEffect(() => {
    if (booking) {
      const merged = { ...formData, ...booking, bookedServices: booking.bookedServices || [] };
      const room = rooms.find(r => r.id === (merged.roomId || rooms[0].id));
      const initialExtraPrice = room ? room.extraPersonPrice : 0;
      setCustomExtraPrice(initialExtraPrice);
      setFormData({
        ...merged,
        amount: calculateTotalAmount(merged.roomId!, merged.startDate!, merged.endDate!, merged.guestCount!, merged.bookedServices!, initialExtraPrice)
      });
    }
  }, [booking]);

  const handleFieldChange = (field: keyof Booking, value: any) => {
    setFormData(prev => {
      let next = { ...prev, [field]: value };
      
      if (field === 'startDate') {
        const checkIn = new Date(value);
        const checkOut = new Date(checkIn);
        checkOut.setDate(checkIn.getDate() + 1);
        next.endDate = toLocalISOString(checkOut);
      }
      
      if (field === 'roomId') {
        const room = rooms.find(r => r.id === value);
        if (room) {
          setCustomExtraPrice(room.extraPersonPrice);
          if (next.guestCount! > room.capacity) next.guestCount = room.capacity;
        }
      }

      if (field === 'startDate' || field === 'endDate') {
        next.bookedServices = (next.bookedServices || []).map(bs => {
          const days = calculateServiceDays(bs.name, next.startDate!, next.endDate!);
          return {
            ...bs,
            startDate: next.startDate!,
            endDate: next.endDate!,
            days: days,
            price: bs.basePrice * days * bs.quantity
          };
        });
      }

      next.amount = calculateTotalAmount(next.roomId!, next.startDate!, next.endDate!, next.guestCount!, next.bookedServices || [], customExtraPrice);
      return next;
    });
  };

  const addService = (serviceId: string) => {
    const def = services.find(s => s.id === serviceId);
    if (!def) return;
    const quantity = formData.guestCount || 1;
    const sDate = formData.startDate!;
    const eDate = formData.endDate!;
    
    const days = calculateServiceDays(def.name, sDate, eDate);
    const totalPrice = def.defaultPrice * days * quantity;

    const newService: BookedService = {
      id: `bs-${Date.now()}`,
      serviceId: def.id,
      name: def.name,
      startDate: sDate,
      endDate: eDate,
      price: totalPrice,
      basePrice: def.defaultPrice,
      quantity: quantity,
      days: days
    };

    const nextServices = [...(formData.bookedServices || []), newService];
    setFormData(prev => ({
      ...prev,
      bookedServices: nextServices,
      amount: calculateTotalAmount(prev.roomId!, prev.startDate!, prev.endDate!, prev.guestCount!, nextServices, customExtraPrice)
    }));
  };

  const updateServiceDetail = (id: string, updates: Partial<BookedService>) => {
    const updated = (formData.bookedServices || []).map(s => {
      if (s.id === id) {
        const nextS = { ...s, ...updates };
        if (updates.startDate || updates.endDate) {
          nextS.days = calculateServiceDays(nextS.name, nextS.startDate, nextS.endDate);
        } else if (updates.days !== undefined) {
          nextS.days = updates.days;
        }
        nextS.price = nextS.basePrice * nextS.days * nextS.quantity;
        return nextS;
      }
      return s;
    });
    setFormData(prev => ({
      ...prev,
      bookedServices: updated,
      amount: calculateTotalAmount(prev.roomId!, prev.startDate!, prev.endDate!, prev.guestCount!, updated, customExtraPrice)
    }));
  };

  const getActionConfig = () => {
    const isNew = !formData.id || isNaN(Number(formData.id));
    if (isNew) return { label: '새 예약 등록하기', status: BookingStatus.PENDING, color: 'bg-indigo-600 hover:bg-indigo-700', icon: <Plus size={24} /> };
    switch (formData.status) {
      case BookingStatus.PENDING: return { label: '예약 확정 처리', status: BookingStatus.CONFIRMED, color: 'bg-indigo-600 hover:bg-indigo-700', icon: <CheckCircle2 size={24} /> };
      case BookingStatus.CONFIRMED: return { label: '손님 체크인(입실)', status: BookingStatus.CHECKED_IN, color: 'bg-emerald-600 hover:bg-emerald-700', icon: <UserCheck size={24} /> };
      case BookingStatus.CHECKED_IN: return { label: '정산 및 체크아웃', status: BookingStatus.CHECKED_OUT, color: 'bg-slate-800 hover:bg-slate-900', icon: <LogOut size={24} /> };
      default: return { label: '예약 정보 업데이트', status: formData.status as BookingStatus, color: 'bg-indigo-600 hover:bg-indigo-700', icon: <Save size={24} /> };
    }
  };

  const action = getActionConfig();
  const selectedRoom = rooms.find(r => r.id === formData.roomId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-[32px] md:rounded-[40px] w-full max-w-6xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] my-auto animate-in fade-in zoom-in-95 duration-300 overflow-hidden border border-slate-200">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-600 rounded-[18px] md:rounded-[22px] flex items-center justify-center text-white shadow-xl">
              {/* Fix: Removed invalid 'md:size' prop from Lucide component */}
              <Calendar size={32} strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{formData.id && !isNaN(Number(formData.id)) ? '예약 상세 및 관리' : '새로운 게스트 등록'}</h3>
              <p className="text-[10px] md:text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">상태: <span className="text-indigo-600 font-black">{formData.status}</span></p>
            </div>
          </div>
          {/* Fix: Removed invalid 'md:size' prop from Lucide component */}
          <button onClick={onClose} className="p-2 md:p-3 hover:bg-slate-200 rounded-2xl transition-all text-slate-400"><X size={32} /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData as Booking); }} className="p-6 md:p-8 space-y-8 md:space-y-10 max-h-[85vh] overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">게스트 성함</label>
                <input required type="text" value={formData.guestName} onChange={e => handleFieldChange('guestName', e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-[18px] outline-none font-black text-lg focus:border-indigo-500 focus:bg-white transition-all shadow-sm" placeholder="성함을 입력하세요" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">숙박 인원 (최대 {selectedRoom?.capacity}인)</label>
                <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-100 rounded-[18px] p-2 shadow-sm">
                  {/* Fix: Removed invalid 'md:size' prop from Lucide component */}
                  <button type="button" onClick={() => handleFieldChange('guestCount', Math.max(1, (formData.guestCount || 1) - 1))} className="p-3 md:p-4 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-indigo-600 shadow-sm"><Minus size={24} /></button>
                  <div className="flex-1 flex items-center justify-center gap-3 font-black text-2xl text-slate-800"><User size={24} className="text-indigo-600" /> {formData.guestCount}명</div>
                  {/* Fix: Removed invalid 'md:size' prop from Lucide component */}
                  <button type="button" onClick={() => handleFieldChange('guestCount', Math.min(selectedRoom?.capacity || 10, (formData.guestCount || 1) + 1))} className="p-3 md:p-4 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-indigo-600 shadow-sm"><Plus size={24} /></button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">객실 선택</label>
                <select value={formData.roomId} onChange={e => handleFieldChange('roomId', e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-[18px] outline-none font-black text-lg focus:border-indigo-500 focus:bg-white transition-all shadow-sm">
                  {rooms.map(room => <option key={room.id} value={room.id}>{room.name} (${room.price})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">체크인</label>
                  <div className="relative group cursor-pointer" onClick={() => startInputRef.current?.showPicker()}>
                    <input ref={startInputRef} required type="date" value={formData.startDate} onChange={e => handleFieldChange('startDate', e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-[18px] outline-none text-base font-black shadow-sm focus:border-indigo-500 transition-all" />
                    <CalendarRange size={24} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-700 bg-indigo-50 p-1 rounded-lg border border-indigo-100 shadow-sm group-hover:scale-110 transition-all" strokeWidth={3} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">체크아웃</label>
                  <div className="relative group cursor-pointer" onClick={() => endInputRef.current?.showPicker()}>
                    <input ref={endInputRef} required type="date" value={formData.endDate} min={formData.startDate} onChange={e => handleFieldChange('endDate', e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-[18px] outline-none text-base font-black shadow-sm focus:border-indigo-500 transition-all" />
                    <CalendarRange size={24} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-700 bg-indigo-50 p-1 rounded-lg border border-indigo-100 shadow-sm group-hover:scale-110 transition-all" strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6 pt-6 border-t border-slate-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h4 className="text-base font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                <Coffee size={24} className="text-indigo-600" /> 부가 서비스 설정
              </h4>
              <div className="flex flex-wrap gap-2 md:gap-3 justify-start md:justify-end max-w-2xl">
                {services.map(s => (
                  <button key={s.id} type="button" onClick={() => addService(s.id)} className="px-4 py-2 bg-white text-indigo-700 border-2 border-indigo-100 rounded-xl text-sm font-black hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-sm">
                    + {s.name} (${s.defaultPrice})
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {(formData.bookedServices || []).length === 0 ? (
                <div className="py-10 text-center border-4 border-dashed border-slate-100 rounded-[28px]">
                  <p className="text-base font-black text-slate-400">등록된 부가 서비스가 없습니다.</p>
                </div>
              ) : (
                (formData.bookedServices || []).map((bs) => (
                  <div key={bs.id} className="bg-white rounded-[24px] border-2 border-slate-100 p-5 md:p-6 flex flex-col gap-5 animate-in fade-in slide-in-from-top-4 transition-all hover:border-indigo-200 shadow-sm hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-900 text-xl">{bs.name}</span>
                        <span className="text-xs font-black text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                          {bs.name.includes('주말') ? '토요일 한정' : bs.name.includes('픽업') ? '1일 고정' : '기간 전체'}
                        </span>
                      </div>
                      <button type="button" onClick={() => handleFieldChange('bookedServices', formData.bookedServices!.filter(s => s.id !== bs.id))} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={24} /></button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2"><Calendar size={14} /> 시작 일자</label>
                        <input type="date" value={bs.startDate} onChange={e => updateServiceDetail(bs.id, { startDate: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-3 text-base font-black outline-none h-[52px]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2"><Calendar size={14} /> 종료 일자</label>
                        <input type="date" value={bs.endDate} min={bs.startDate} onChange={e => updateServiceDetail(bs.id, { endDate: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-3 text-base font-black outline-none h-[52px]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2"><Hash size={14} /> 적용 일수</label>
                        <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-3 h-[52px]">
                          <button type="button" onClick={() => updateServiceDetail(bs.id, { days: Math.max(0, bs.days - 1) })} className="text-slate-400 hover:text-indigo-600"><Minus size={18} /></button>
                          <input type="number" value={bs.days} onChange={e => updateServiceDetail(bs.id, { days: Number(e.target.value) })} className="text-base font-black flex-1 text-center outline-none bg-transparent w-10" />
                          <button type="button" onClick={() => updateServiceDetail(bs.id, { days: bs.days + 1 })} className="text-slate-400 hover:text-indigo-600"><Plus size={18} /></button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase">단가 ($)</label>
                        <input type="number" value={bs.basePrice} onChange={e => updateServiceDetail(bs.id, { basePrice: Number(e.target.value) })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-3 text-base font-black outline-none text-indigo-600 h-[52px]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase">수량(명/개)</label>
                        <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-3 h-[52px]">
                          <button type="button" onClick={() => updateServiceDetail(bs.id, { quantity: Math.max(1, bs.quantity - 1) })} className="text-slate-400 hover:text-indigo-600"><Minus size={18} /></button>
                          <span className="text-base font-black flex-1 text-center">{bs.quantity}</span>
                          <button type="button" onClick={() => updateServiceDetail(bs.id, { quantity: bs.quantity + 1 })} className="text-slate-400 hover:text-indigo-600"><Plus size={18} /></button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-1">
                       <div className="text-sm font-black text-slate-500 italic">
                         계산 상세: <span className="text-indigo-600 font-black px-1">${bs.basePrice}</span> x <span>{bs.days}일</span> x <span>{bs.quantity}개</span>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">ITEM TOTAL</p>
                          <p className="text-3xl font-black text-indigo-600 leading-none">$ {bs.price.toLocaleString()}</p>
                        </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[32px] md:rounded-[40px] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
              <div className="space-y-2 md:space-y-3">
                <p className="text-[10px] md:text-[11px] font-black text-indigo-300 uppercase tracking-[0.4em]">GRAND TOTAL BILLING</p>
                <h2 className="text-4xl md:text-6xl font-black">$ {(formData.amount || 0).toLocaleString()}</h2>
              </div>
              <div className="flex gap-6 md:gap-12 bg-white/5 p-5 md:p-8 rounded-[24px] md:rounded-[32px] backdrop-blur-sm border border-white/10 w-full md:w-auto">
                <div className="text-right flex-1 md:flex-none">
                  <p className="text-[10px] text-slate-400 font-black uppercase mb-1 md:mb-2">ROOM CHARGE</p>
                  <p className="text-lg md:text-xl font-black text-indigo-100">$ {(calculateTotalAmount(formData.roomId!, formData.startDate!, formData.endDate!, formData.guestCount!, [], customExtraPrice)).toLocaleString()}</p>
                </div>
                <div className="text-right flex-1 md:flex-none">
                  <p className="text-[10px] text-slate-400 font-black uppercase mb-1 md:mb-2">SERVICE TOTAL</p>
                  <p className="text-lg md:text-xl font-black text-indigo-100">$ {(formData.bookedServices || []).reduce((a, b) => a + b.price, 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-[100px]"></div>
          </div>

          <div className="flex gap-4 md:gap-6 pt-6 sticky bottom-0 bg-white/95 backdrop-blur-xl pb-6 z-20 border-t border-slate-100">
            {formData.id && !isNaN(Number(formData.id)) && (
              <button type="button" onClick={() => onDelete(formData.id!)} className="px-5 md:px-8 py-4 md:py-5 bg-rose-50 text-rose-600 rounded-[20px] md:rounded-[24px] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-rose-100 transition-all border-2 border-rose-100">DELETE</button>
            )}
            <div className="flex-1"></div>
            <button type="button" onClick={onClose} className="px-6 md:px-10 py-4 md:py-5 bg-slate-100 text-slate-500 rounded-[20px] md:rounded-[24px] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-slate-200 transition-all">CANCEL</button>
            <button type="submit" className={`px-8 md:px-14 py-4 md:py-5 ${action.color} text-white rounded-[20px] md:rounded-[24px] font-black text-xs md:text-sm uppercase tracking-widest shadow-2xl flex items-center gap-2 md:gap-3 active:scale-95 transition-all`}>
              {/* Fix: Added proper casting to React.ReactElement<any> to resolve TypeScript error in cloneElement */}
              {React.cloneElement(action.icon as React.ReactElement<any>, { size: 20 })} <span>{action.label}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;