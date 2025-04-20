import express from 'express';
import {
  getAllSlots,
  getSlotById,
  createSlot,
  bookSlot,
  updateSlotFeedback,
  getUpcomingCoachSlots,
  getAvailableSlots,
  getPastCoachSessions
} from '../controllers/slotController';

const router = express.Router();

// Get available slots for students to book
router.get('/available', getAvailableSlots);

// Get upcoming slots for a coach
router.get('/coach/:coach_id/upcoming', getUpcomingCoachSlots);

// Get past sessions for a coach with feedback
router.get('/coach/:coach_id/past', getPastCoachSessions);

// Get all slots
router.get('/', getAllSlots);

// Get slot by ID
router.get('/:id', getSlotById);

// Create a new slot (coach adds availability)
router.post('/', createSlot);

// Book a slot (student books an available slot)
router.patch('/:id/book', bookSlot);

// Update slot with satisfaction score and notes (after a call)
router.patch('/:id/feedback', updateSlotFeedback);

export default router;
