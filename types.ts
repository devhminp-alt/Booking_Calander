
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
  quantity: number; 
  days: number; // Restored mandatory field
}

export interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;      
  baseCapacity: number;  
  extraPersonPrice: number; 
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
  guestCount: number; 
  startDate: string; 
  endDate: string;   
  status: BookingStatus;
  guestPhone?: string;
  notes?: string;
  amount: number;
  bookedServices: BookedService[];
  invoiceId?: string; // Added to map to the SQLite Invoice relationship
}

export interface AIResponse {
  summary: string;
  suggestions: string[];
  insights: string;
}
