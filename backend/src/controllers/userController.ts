import { Request, Response } from 'express';
import User from '../models/User';

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Get all coaches
export const getAllCoaches = async (req: Request, res: Response) => {
  try {
    const coaches = await User.findAll({
      where: {
        user_type: 'coach'
      }
    });

    return res.status(200).json(coaches);
  } catch (error) {
    console.error('Error fetching coaches:', error);
    return res.status(500).json({ error: 'Failed to fetch coaches' });
  }
};

// Get all students
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const students = await User.findAll({
      where: {
        user_type: 'student'
      }
    });

    return res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ error: 'Failed to fetch students' });
  }
};
