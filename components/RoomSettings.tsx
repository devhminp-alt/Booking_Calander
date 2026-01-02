
import React, { useState } from 'react';
import { Room, ServiceDefinition, ServiceType } from '../types';
import { Plus, Trash2, Home, Users, DollarSign, Check, X, Bath, Edit2, MapPin, Info, Coffee, Car, Truck, Settings, UserPlus } from 'lucide-react';

interface Props {
  rooms: Room[];
  services: ServiceDefinition[];
  onAddRoom: (room: Room) => void;
  onUpdateRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string) => void;
  onUpdateServices: (services: ServiceDefinition[]) => void;
}

const RoomSettings: React.FC<Props> = ({ rooms, services, onAddRoom, onUpdateRoom, onDeleteRoom, onUpdateServices }) => {
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  
  const [roomForm, setRoomForm] = useState<Partial<Room>>({
    name: '', type: '트윈', capacity: 2, baseCapacity: 1, extraPersonPrice: 15.00, price: 70.00, hasBathroom: true, description: '', building: '', roomNumber: '',
    color: 'bg-blue-100 border-blue-300 text-blue-800'
  });

  const [serviceForm, setServiceForm] = useState<Partial<ServiceDefinition>>({
    name: '', defaultPrice: 10.00, type: 'custom'
  });

  const COLORS = [
    { label: '블루', value: 'bg-blue-100 border-blue-300 text-blue-800' },
    { label: '그린', value: 'bg-green-100 border-green-300 text-green-800' },
    { label: '퍼플', value: 'bg-purple-100 border-purple-300 text-purple-800' },
    { label: '오렌지', value: 'bg-orange-100 border-orange-300 text-orange-800' },
    { label: '그레이', value: 'bg-gray-100 border-gray-300 text-gray-800' },
    { label: '로즈', value: 'bg-rose-100 border-rose-300 text-rose-800' },
    { label: '황금', value: 'bg-amber-100 border-amber-300 text-amber-800' },
  ];

  const handleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.name) return;
    if (editingRoomId) {
      onUpdateRoom({ ...roomForm as Room, id: editingRoomId });
      setEditingRoomId(null);
    } else {
      onAddRoom({ ...roomForm as Room, id: `r-${Date.now()}` });
    }
    resetRoomForm();
  };

  const resetRoomForm = () => {
    setRoomForm({ name: '', type: '트윈', capacity: 2, baseCapacity: 1, extraPersonPrice: 15.00, price: 70.00, hasBathroom: true, description: '', building: '', roomNumber: '', color: 'bg-blue-100 border-blue-300 text-blue-800' });
    setEditingRoomId(null);
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name) return;
    const newService: ServiceDefinition = {
      ...serviceForm as ServiceDefinition,
      id: `s-${Date.now()}`
    };
    onUpdateServices([...services, newService]);
    setServiceForm({ name: '', defaultPrice: 10.00, type: 'custom' });
  };

  const handleDeleteService = (id: string) => {
    onUpdateServices(services.filter(s => s.id !== id));
  };

  const getServiceIcon = (type: ServiceType) => {
    switch (type) {
      case 'rental': return <Car size={16} />;
      case 'meal': return <Coffee size={16} />;
      case 'pickup': return <Truck size={16} />;
      default: return <Plus size={16} />;
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            {editingRoomId ? <Edit2 size={24} className="text-indigo-600" /> : <Plus size={24} className="text-indigo-600" />}
            {editingRoomId ? '객실 정보 수정' : '신규 객실 등록'}
          </h3>
          <form onSubmit={handleRoomSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">객실 명칭</label>
              <input required type="text" value={roomForm.name} onChange={e => setRoomForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">객실 타입</label>
              <select value={roomForm.type} onChange={e => setRoomForm(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                <option value="트윈">트윈</option><option value="싱글">싱글</option><option value="더블">더블</option><option value="퀸">퀸</option><option value="킹">킹</option><option value="복층">복층</option><option value="도미토리">도미토리</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">1박 요금 ($)</label>
              <input type="number" step="1" value={roomForm.price} onChange={e => setRoomForm(p => ({ ...p, price: Number(e.target.value) }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-indigo-600" />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">최대 수용 인원</label>
              <div className="relative">
                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="number" value={roomForm.capacity} onChange={e => setRoomForm(p => ({ ...p, capacity: Number(e.target.value) }))} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">기준 인원 (추가요금 시작점)</label>
              <div className="relative">
                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="number" value={roomForm.baseCapacity} onChange={e => setRoomForm(p => ({ ...p, baseCapacity: Number(e.target.value) }))} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">1인당 추가 요금 ($)</label>
              <div className="relative">
                <UserPlus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                <input type="number" step="1" value={roomForm.extraPersonPrice} onChange={e => setRoomForm(p => ({ ...p, extraPersonPrice: Number(e.target.value) }))} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-indigo-600" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">건물(동)</label>
              <input type="text" value={roomForm.building} onChange={e => setRoomForm(p => ({ ...p, building: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">호수</label>
              <input type="text" value={roomForm.roomNumber} onChange={e => setRoomForm(p => ({ ...p, roomNumber: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-1 flex items-end">
              <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer w-full h-[50px]">
                <input type="checkbox" checked={roomForm.hasBathroom} onChange={e => setRoomForm(p => ({ ...p, hasBathroom: e.target.checked }))} className="w-5 h-5 rounded" />
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2"><Bath size={18} /> 개별 화장실 있음</span>
              </label>
            </div>
            
            <div className="md:col-span-2 lg:col-span-3 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">객실 상세 설명</label>
              <textarea value={roomForm.description} onChange={e => setRoomForm(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl h-20 resize-none" />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3">
              {editingRoomId && <button type="button" onClick={resetRoomForm} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold">취소</button>}
              <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg flex items-center gap-2">{editingRoomId ? '수정 완료' : '객실 추가'}</button>
            </div>
          </form>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Home size={24} className="text-indigo-600" /> 운영 중인 객실</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <th className="pb-4 pl-4">객실명</th><th className="pb-4">수용인원</th><th className="pb-4">가격</th><th className="pb-4 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rooms.map(room => (
                  <tr key={room.id} className="hover:bg-slate-50 group">
                    <td className="py-4 pl-4 font-bold text-slate-700">{room.name}</td>
                    <td className="py-4 text-sm text-slate-500">{room.baseCapacity}인 기준 / 최대 {room.capacity}인</td>
                    <td className="py-4 font-bold text-indigo-600">$ {room.price.toLocaleString()}</td>
                    <td className="py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setRoomForm(room); setEditingRoomId(room.id); }} className="p-2 text-indigo-400 hover:text-indigo-600 transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => onDeleteRoom(room.id)} className="p-2 text-rose-400 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Settings size={24} className="text-indigo-600" />
            부가 서비스 설정
          </h3>
          <form onSubmit={handleServiceSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">서비스명</label>
              <input required type="text" value={serviceForm.name} onChange={e => setServiceForm(p => ({ ...p, name: e.target.value }))} placeholder="예: 바베큐 그릴" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">기본 요금 ($)</label>
              <input type="number" step="1" value={serviceForm.defaultPrice} onChange={e => setServiceForm(p => ({ ...p, defaultPrice: Number(e.target.value) }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">분류</label>
              <select value={serviceForm.type} onChange={e => setServiceForm(p => ({ ...p, type: e.target.value as ServiceType }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                <option value="rental">렌트카</option>
                <option value="meal">식사</option>
                <option value="pickup">픽업</option>
                <option value="custom">기타</option>
              </select>
            </div>
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
              <Plus size={18} /> 서비스 추가
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(service => (
            <div key={service.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                  {getServiceIcon(service.type)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{service.name}</h4>
                  <p className="text-xs text-slate-500">기본 $ {service.defaultPrice.toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => handleDeleteService(service.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RoomSettings;
