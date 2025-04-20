import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import userRoutes from './routes/userRoutes';
import slotRoutes from './routes/slotRoutes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/users', userRoutes);
app.use('/api/slots', slotRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
res.status(200).json({ status: 'ok' });
});

// Database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established successfully');

    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

export default app;
