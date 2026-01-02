
import React, { useState, useEffect } from 'react';
import { Room, Booking, BookingStatus, ServiceDefinition, BookedService, ServiceType } from '../types';
import { X, Trash2, Save, Calendar, User, Phone, CreditCard, Plus, Minus, Coffee, Edit3, CalendarRange, Clock, UserPlus, CheckCircle2, UserCheck, LogOut } from 'lucide-react';

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

  const getWeekdaysCount = (start: string, end: string) => {
    let count = 0;
    let curr = new Date(start);
    const stop = new Date(end);
    while (curr < stop) {
      const day = curr.getDay();
      if (day !== 0 && day !== 6) count++;
      curr.setDate(curr.getDate() + 1);
    }
    return count;
  };

  const calculateTotalAmount = (roomId: string, start: string, end: string, guestCount: number, bookedServices: BookedService[], extraPrice: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return 0;
    const nights = getDayDiff(start, end);
    const extraGuests = Math.max(0, guestCount - 1);
    const roomBaseTotal = (room.price + (extraGuests * extraPrice)) * nights;
    const servicesTotal = (bookedServices || []).reduce((acc, s) => acc + s.price, 0);
    return roomBaseTotal + servicesTotal;
  };

  useEffect(() => {
    if (booking) {
      const merged = {
        ...formData,
        ...booking,
        bookedServices: booking.bookedServices || []
      };
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
      
      if (field === 'endDate' && next.startDate && value < next.startDate) {
        next.startDate = value;
      }

      if (field === 'roomId') {
        const room = rooms.find(r => r.id === value);
        if (room) {
          setCustomExtraPrice(room.extraPersonPrice);
          if (next.guestCount! > room.capacity) next.guestCount = room.capacity;
        }
      }

      if (field === 'guestCount') {
        const room = rooms.find(r => r.id === next.roomId);
        if (room && value > room.capacity) next.guestCount = room.capacity;
      }

      next.amount = calculateTotalAmount(next.roomId!, next.startDate!, next.endDate!, next.guestCount!, next.bookedServices || [], customExtraPrice);
      return next;
    });
  };

  const handleExtraPriceChange = (val: number) => {
    setCustomExtraPrice(val);
    setFormData(prev => ({
      ...prev,
      amount: calculateTotalAmount(prev.roomId!, prev.startDate!, prev.endDate!, prev.guestCount!, prev.bookedServices || [], val)
    }));
  };

  const addService = (serviceId: string) => {
    const def = services.find(s => s.id === serviceId);
    if (!def) return;

    const quantity = formData.guestCount || 1;
    const sDate = formData.startDate!;
    const eDate = formData.endDate!;
    
    let initialPrice = 0;
    if (def.type === 'meal') {
      const weekdays = getWeekdaysCount(sDate, eDate);
      initialPrice = def.defaultPrice * weekdays * quantity;
    } else {
      const days = Math.max(1, getDayDiff(sDate, eDate));
      initialPrice = def.defaultPrice * days * quantity;
    }

    const newService: BookedService = {
      id: `bs-${Date.now()}`,
      serviceId: def.id,
      name: def.name,
      startDate: sDate,
      endDate: eDate,
      price: initialPrice,
      basePrice: def.defaultPrice,
      quantity: quantity
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
        const def = services.find(serv => serv.id === nextS.serviceId);
        if (def?.type === 'meal') {
          const count = getWeekdaysCount(nextS.startDate, nextS.endDate);
          nextS.price = nextS.basePrice * count * nextS.quantity;
        } else {
          const days = Math.max(1, getDayDiff(nextS.startDate, nextS.endDate));
          nextS.price = nextS.basePrice * days * nextS.quantity;
        }
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

  // 상태 기반 액션 버튼 렌더링을 위한 헬퍼 함수
  const getActionConfig = () => {
    if (!formData.id) return { label: '새 예약 등록하기', status: BookingStatus.PENDING, color: 'bg-indigo-600 hover:bg-indigo-700', icon: <Plus size={20} /> };

    switch (formData.status) {
      case BookingStatus.PENDING:
        return { label: '예약 확정 처리', status: BookingStatus.CONFIRMED, color: 'bg-indigo-600 hover:bg-indigo-700', icon: <CheckCircle2 size={20} /> };
      case BookingStatus.CONFIRMED:
        return { label: '손님 체크인(입실)', status: BookingStatus.CHECKED_IN, color: 'bg-emerald-600 hover:bg-emerald-700', icon: <UserCheck size={20} /> };
      case BookingStatus.CHECKED_IN:
        return { label: '정산 및 체크아웃', status: BookingStatus.CHECKED_OUT, color: 'bg-slate-800 hover:bg-slate-900', icon: <LogOut size={20} /> };
      default:
        return { label: '예약 정보 업데이트', status: formData.status as BookingStatus, color: 'bg-indigo-600 hover:bg-indigo-700', icon: <Save size={20} /> };
    }
  };

  const action = getActionConfig();
  const selectedRoom = rooms.find(r => r.id === formData.roomId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl my-auto animate-in fade-in zoom-in duration-300 overflow-hidden">
        {/* 헤더 */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">{formData.id ? '예약 상세 및 상태 관리' : '새로운 게스트 등록'}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                현재 상태: <span className="text-indigo-600 font-black">{formData.status}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave({ ...formData as Booking, status: action.status, id: formData.id || `b-${Date.now()}` }); }} className="p-8 space-y-8 max-h-[85vh] overflow-y-auto">
          {/* 기본 정보 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">게스트 성함</label>
                <input required type="text" value={formData.guestName} onChange={e => handleFieldChange('guestName', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="실명을 입력하세요" />
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">숙박 인원 (최대 {selectedRoom?.capacity}인)</label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5">
                    <button type="button" onClick={() => handleFieldChange('guestCount', Math.max(1, (formData.guestCount || 1) - 1))} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400"><Minus size={18} /></button>
                    <div className="flex-1 flex items-center justify-center gap-2">
                      <User size={18} className="text-indigo-600" />
                      <span className="font-black text-lg">{formData.guestCount}명</span>
                    </div>
                    <button type="button" onClick={() => handleFieldChange('guestCount', Math.min(selectedRoom?.capacity || 10, (formData.guestCount || 1) + 1))} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400"><Plus size={18} /></button>
                  </div>
                </div>

                <div className={`space-y-1 transition-all duration-300 overflow-hidden ${formData.guestCount! > 1 ? 'max-h-24 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                  <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                    <UserPlus size={12} /> 추가 인원 요금 설정 (1인당 / 박)
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={customExtraPrice} 
                      onChange={e => handleExtraPriceChange(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl outline-none font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-300">₩</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">객실 선택</label>
                <select value={formData.roomId} onChange={e => handleFieldChange('roomId', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>{room.name} (₩{room.price.toLocaleString()})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">체크인</label>
                  <input required type="date" value={formData.startDate} onChange={e => handleFieldChange('startDate', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">체크아웃</label>
                  <input required type="date" value={formData.endDate} min={formData.startDate} onChange={e => handleFieldChange('endDate', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm font-bold" />
                </div>
              </div>
            </div>
          </div>

          {/* 부가 서비스 섹션 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Coffee size={18} className="text-indigo-600" /> 서비스 상세 정산
              </h4>
              <div className="flex gap-2">
                {services.map(s => (
                  <button key={s.id} type="button" onClick={() => addService(s.id)} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-all">+ {s.name}</button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {(formData.bookedServices || []).map((bs) => {
                const isMeal = services.find(s => s.id === bs.serviceId)?.type === 'meal';
                const duration = isMeal ? getWeekdaysCount(bs.startDate, bs.endDate) : Math.max(1, getDayDiff(bs.startDate, bs.endDate));
                
                return (
                  <div key={bs.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 animate-in fade-in slide-in-from-top-2 transition-all hover:border-indigo-300">
                    <div className="flex flex-col xl:flex-row gap-6">
                      <div className="xl:w-48 flex-shrink-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-black text-slate-800 text-sm flex items-center gap-2">
                            {isMeal ? <Coffee size={14} className="text-amber-500" /> : <Plus size={14} className="text-indigo-500" />}
                            {bs.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-indigo-600">총 {duration}{isMeal ? '일' : '박'} 이용</span>
                        </div>
                      </div>

                      <div className="flex-[2] min-w-[280px] space-y-2">
                        <div className="flex items-center gap-2">
                          <input type="date" value={bs.startDate} onChange={e => updateServiceDetail(bs.id, { startDate: e.target.value })} className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 min-w-[120px]" />
                          <span className="text-slate-300 font-bold shrink-0">~</span>
                          <input type="date" value={bs.endDate} min={bs.startDate} onChange={e => updateServiceDetail(bs.id, { endDate: e.target.value })} className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 min-w-[120px]" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-[200px] grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <input type="number" value={bs.basePrice} onChange={e => updateServiceDetail(bs.id, { basePrice: Number(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold outline-none text-indigo-600" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-2 py-2 h-[34px]">
                            <button type="button" onClick={() => updateServiceDetail(bs.id, { quantity: Math.max(1, bs.quantity - 1) })} className="text-slate-400 hover:text-indigo-600"><Minus size={12} /></button>
                            <span className="text-xs font-black flex-1 text-center">{bs.quantity}</span>
                            <button type="button" onClick={() => updateServiceDetail(bs.id, { quantity: bs.quantity + 1 })} className="text-slate-400 hover:text-indigo-600"><Plus size={12} /></button>
                          </div>
                        </div>
                      </div>

                      <div className="xl:w-32 flex xl:flex-col items-center xl:items-end justify-between xl:justify-center gap-2">
                        <div className="text-right">
                          <p className="text-sm font-black text-indigo-600">₩{bs.price.toLocaleString()}</p>
                        </div>
                        <button type="button" onClick={() => handleFieldChange('bookedServices', formData.bookedServices!.filter(s => s.id !== bs.id))} className="hidden xl:block p-1.5 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 최종 정산 영역 */}
          <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">Total Settlement Summary</p>
                <div className="flex items-center gap-2">
                  <h2 className="text-4xl font-black">₩{(formData.amount || 0).toLocaleString()}</h2>
                  <span className="text-sm font-bold text-slate-400 opacity-60">전체 합계</span>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Room Total</p>
                  <p className="font-bold text-sm text-indigo-100">₩{(calculateTotalAmount(formData.roomId!, formData.startDate!, formData.endDate!, formData.guestCount!, [], customExtraPrice)).toLocaleString()}</p>
                </div>
                <div className="w-px h-10 bg-slate-700"></div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Service Total</p>
                  <p className="font-bold text-sm text-indigo-100">₩{(formData.bookedServices || []).reduce((a, b) => a + b.price, 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          </div>

          {/* 하단 액션 버튼 */}
          <div className="flex gap-4 pt-4 sticky bottom-0 bg-white/95 backdrop-blur-md pb-4 z-20 border-t border-slate-50">
            {formData.id && (
              <button type="button" onClick={() => onDelete(formData.id!)} className="px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100">예약 취소</button>
            )}
            <div className="flex-1"></div>
            <button type="button" onClick={onClose} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">창 닫기</button>
            
            {/* 상태 전환 기반 통합 액션 버튼 */}
            <button 
              type="submit" 
              className={`px-10 py-4 ${action.color} text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-2`}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
