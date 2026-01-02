
import { Room, BookingStatus, Booking, ServiceDefinition } from './types';

export const ROOMS: Room[] = [
  { 
    id: '101', name: '스탠다드 오션', type: '트윈', 
    capacity: 3, baseCapacity: 2, extraPersonPrice: 20000, 
    price: 80000, color: 'bg-blue-100 border-blue-300 text-blue-800', 
    hasBathroom: true, description: '바다가 한눈에 보이는 아늑한 트윈룸입니다.', 
    building: 'A동', roomNumber: '101호' 
  },
  { 
    id: '102', name: '스탠다드 가든', type: '트윈', 
    capacity: 2, baseCapacity: 2, extraPersonPrice: 0, 
    price: 75000, color: 'bg-green-100 border-green-300 text-green-800', 
    hasBathroom: true, description: '정원 전망의 조용한 객실입니다.', 
    building: 'A동', roomNumber: '102호' 
  },
  { 
    id: '201', name: '디럭스 스위트', type: '퀸', 
    capacity: 2, baseCapacity: 2, extraPersonPrice: 0, 
    price: 120000, color: 'bg-purple-100 border-purple-300 text-purple-800', 
    hasBathroom: true, description: '최고급 침구와 넓은 공간을 자랑하는 스위트룸입니다.', 
    building: 'B동', roomNumber: '201호' 
  },
  { 
    id: '202', name: '패밀리 로프트', type: '복층', 
    capacity: 6, baseCapacity: 4, extraPersonPrice: 25000, 
    price: 150000, color: 'bg-orange-100 border-orange-300 text-orange-800', 
    hasBathroom: true, description: '가족 단위 여행객에게 적합한 넓은 복층 객실입니다.', 
    building: 'B동', roomNumber: '202호' 
  },
  { 
    id: '203', name: '미니멀리스트 팟', type: '싱글', 
    capacity: 1, baseCapacity: 1, extraPersonPrice: 0, 
    price: 50000, color: 'bg-gray-100 border-gray-300 text-gray-800', 
    hasBathroom: false, description: '1인 여행자를 위한 실속형 공용 욕실 이용 객실입니다.', 
    building: 'C동', roomNumber: '101호' 
  },
];

export const INITIAL_SERVICES: ServiceDefinition[] = [
  { id: 's1', name: '렌트카', defaultPrice: 50000, type: 'rental' },
  { id: 's2', name: '식사 (조식)', defaultPrice: 10000, type: 'meal' },
  { id: 's3', name: '공항 픽업', defaultPrice: 30000, type: 'pickup' },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    roomId: '101',
    guestName: '김민수',
    guestCount: 2,
    startDate: '2024-05-20',
    endDate: '2024-05-23',
    status: BookingStatus.CONFIRMED,
    amount: 240000,
    bookedServices: []
  },
  {
    id: 'b2',
    roomId: '201',
    guestName: '이서연',
    guestCount: 2,
    startDate: '2024-05-21',
    endDate: '2024-05-22',
    status: BookingStatus.CHECKED_IN,
    amount: 120000,
    bookedServices: []
  },
  {
    id: 'b3',
    roomId: '202',
    guestName: '박준호',
    guestCount: 5, // 1명 초과 (추가 요금 발생)
    startDate: '2024-05-24',
    endDate: '2024-05-26',
    status: BookingStatus.PENDING,
    amount: 350000, // (15만*2) + (2.5만*1명*2박) = 35만
    bookedServices: []
  },
];
