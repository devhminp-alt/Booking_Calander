
export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT'
}

export type ServiceType = 'rental' | 'meal' | 'pickup' | 'custom';

export interface ServiceDefinition {
  id: string;
  name: string;
  defaultPrice: number;
  type: ServiceType;
}

export interface BookedService {
  id: string;
  serviceId: string;
  name: string;
  startDate: string;
  endDate: string;
  price: number;
  basePrice: number; 
  quantity: number; // 서비스 이용 인원/수량 추가
}

export interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;      // 최대 인원
  baseCapacity: number;  // 기준 인원 (추가 요금 발생 지점)
  extraPersonPrice: number; // 1인당 추가 요금
  price: number;
  color: string;
  hasBathroom: boolean;
  description?: string;
  building?: string;
  roomNumber?: string;
}

export interface Booking {
  id: string;
  roomId: string;
  guestName: string;
  guestCount: number; // 숙박 인원수 추가
  startDate: string; 
  endDate: string;   
  status: BookingStatus;
  guestPhone?: string;
  notes?: string;
  amount: number;
  bookedServices: BookedService[];
}

export interface AIResponse {
  summary: string;
  suggestions: string[];
  insights: string;
}
