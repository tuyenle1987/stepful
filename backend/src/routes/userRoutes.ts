import express from 'express';
import {
  getAllUsers,
  getUserById,
  getAllCoaches,
  getAllStudents
} from '../controllers/userController';

const router = express.Router();

// Get all users
router.get('/', getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

// Get all coaches
router.get('/type/coaches', getAllCoaches);

// Get all students
router.get('/type/students', getAllStudents);

export default router;
