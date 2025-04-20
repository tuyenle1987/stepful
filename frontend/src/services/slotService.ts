// Get available slots for students to book
export const getAvailableSlots = async (): Promise<Slot[]> => {
  const response = await api.get('/slots/available');
  return response.data;
};

// Get past sessions for a coach with feedback
export const getPastCoachSessions = async (coachId: number): Promise<Slot[]> => {
  const response = await api.get(`/slots/coach/${coachId}/past`);
  return response.data;
};import api from './api';
import { User } from '../contexts/UserContext';

export interface Slot {
  id: number;
  coach_id: number;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  student_id?: number;
  satisfaction_score?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  coach?: User;
  student?: User;
}

export interface SlotCreationParams {
  coach_id: number;
  start_time: string;
}

export interface SlotBookingParams {
  student_id: number;
}

export interface SlotFeedbackParams {
  satisfaction_score: number;
  notes: string;
}

// Get all slots
export const getAllSlots = async (): Promise<Slot[]> => {
  const response = await api.get('/slots');
  return response.data;
};

// Get slot by ID
export const getSlotById = async (id: number): Promise<Slot> => {
  const response = await api.get(`/slots/${id}`);
  return response.data;
};

// Create a new slot (coach adds availability)
export const createSlot = async (params: SlotCreationParams): Promise<Slot> => {
  const response = await api.post('/slots', params);
  return response.data;
};

// Book a slot (student books an available slot)
export const bookSlot = async (id: number, params: SlotBookingParams): Promise<Slot> => {
  const response = await api.patch(`/slots/${id}/book`, params);
  return response.data;
};

// Update slot with satisfaction score and notes (after a call)
export const updateSlotFeedback = async (id: number, params: SlotFeedbackParams): Promise<Slot> => {
  const response = await api.patch(`/slots/${id}/feedback`, params);
  return response.data;
};

// Get upcoming slots for a coach
export const getUpcomingCoachSlots = async (coachId: number): Promise<Slot[]> => {
  const response = await api.get(`/slots/coach/${coachId}/upcoming`);
  return response.data;
};
