import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Slot from '../models/Slot';
import User from '../models/User';

// Get all slots
export const getAllSlots = async (req: Request, res: Response) => {
  try {
    const slots = await Slot.findAll({
      include: [
        { model: User, as: 'coach', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] }
      ]
    });

    return res.status(200).json(slots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    return res.status(500).json({ error: 'Failed to fetch slots' });
  }
};

// Get slot by ID
export const getSlotById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const slot = await Slot.findByPk(id, {
      include: [
        { model: User, as: 'coach', attributes: ['id', 'name', 'email', 'phone_number'] },
        { model: User, as: 'student', attributes: ['id', 'name', 'email', 'phone_number'] }
      ]
    });

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    return res.status(200).json(slot);
  } catch (error) {
    console.error('Error fetching slot:', error);
    return res.status(500).json({ error: 'Failed to fetch slot' });
  }
};

// Create a new slot (coach adds availability)
export const createSlot = async (req: Request, res: Response) => {
  try {
    const { coach_id, start_time } = req.body;

    // Verify the user is a coach
    const coach = await User.findOne({
      where: {
        id: coach_id,
        user_type: 'coach'
      }
    });

    if (!coach) {
      return res.status(400).json({ error: 'Invalid coach ID' });
    }

    // Calculate end_time (2 hours after start_time)
    const startDate = new Date(start_time);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours

    // Create the slot
    const newSlot = await Slot.create({
      coach_id,
      start_time: startDate,
      end_time: endDate
    });

    return res.status(201).json(newSlot);
  } catch (error) {
    console.error('Error creating slot:', error);
    return res.status(500).json({ error: 'Failed to create slot' });
  }
};

// Book a slot (student books an available slot)
export const bookSlot = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { student_id } = req.body;

    // Find the slot
    const slot = await Slot.findByPk(id);

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    // Check if slot is already booked
    if (slot.is_booked) {
      return res.status(400).json({ error: 'Slot is already booked' });
    }

    // Verify the user is a student
    const student = await User.findOne({
      where: {
        id: student_id,
        user_type: 'student'
      }
    });

    if (!student) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    // Book the slot
    slot.is_booked = true;
    slot.student_id = student_id;
    await slot.save();

    return res.status(200).json(slot);
  } catch (error) {
    console.error('Error booking slot:', error);
    return res.status(500).json({ error: 'Failed to book slot' });
  }
};

// Update slot with satisfaction score and notes (after a call)
export const updateSlotFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { satisfaction_score, notes } = req.body;

    // Find the slot
    const slot = await Slot.findByPk(id);

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    // Check if slot is booked
    if (!slot.is_booked) {
      return res.status(400).json({ error: 'Cannot update feedback for an unbooked slot' });
    }

    // Update the slot
    slot.satisfaction_score = satisfaction_score;
    slot.notes = notes;
    await slot.save();

    return res.status(200).json(slot);
  } catch (error) {
    console.error('Error updating slot feedback:', error);
    return res.status(500).json({ error: 'Failed to update slot feedback' });
  }
};

// Get upcoming slots for a coach
export const getUpcomingCoachSlots = async (req: Request, res: Response) => {
  try {
    const { coach_id } = req.params;

    // Verify the user is a coach
    const coach = await User.findOne({
      where: {
        id: coach_id,
        user_type: 'coach'
      }
    });

    if (!coach) {
      return res.status(400).json({ error: 'Invalid coach ID' });
    }

    // Get current date
    const now = new Date();

    // Find upcoming slots for the coach
    const slots = await Slot.findAll({
      where: {
        coach_id,
        start_time: {
          [Op.gt]: now
        }
      },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email', 'phone_number'] }
      ],
      order: [['start_time', 'ASC']]
    });

    return res.status(200).json(slots);
  } catch (error) {
    console.error('Error fetching upcoming coach slots:', error);
    return res.status(500).json({ error: 'Failed to fetch upcoming coach slots' });
  }
};

// Get available slots for students to book
export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    // Get current date
    const now = new Date();

    // Find available slots (not booked and in the future)
    const slots = await Slot.findAll({
      where: {
        is_booked: false,
        start_time: {
          [Op.gt]: now
        }
      },
      include: [
        { model: User, as: 'coach', attributes: ['id', 'name', 'email'] }
      ],
      order: [['start_time', 'ASC']]
    });

    return res.status(200).json(slots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return res.status(500).json({ error: 'Failed to fetch available slots' });
  }
};

// Get past sessions for a coach with feedback
export const getPastCoachSessions = async (req: Request, res: Response) => {
  try {
    const { coach_id } = req.params;

    // Verify the user is a coach
    const coach = await User.findOne({
      where: {
        id: coach_id,
        user_type: 'coach'
      }
    });

    if (!coach) {
      return res.status(400).json({ error: 'Invalid coach ID' });
    }

    // Get current date
    const now = new Date();

    // Find past booked slots for the coach
    const slots = await Slot.findAll({
      where: {
        coach_id,
        is_booked: true,
        end_time: {
          [Op.lt]: now
        }
      },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] }
      ],
      order: [['end_time', 'DESC']]
    });

    return res.status(200).json(slots);
  } catch (error) {
    console.error('Error fetching past coach sessions:', error);
    return res.status(500).json({ error: 'Failed to fetch past coach sessions' });
  }
};
