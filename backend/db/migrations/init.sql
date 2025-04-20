-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('coach', 'student')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Slots table
CREATE TABLE IF NOT EXISTS slots (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER REFERENCES users(id) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  student_id INTEGER REFERENCES users(id),
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_slots_coach_id ON slots(coach_id);
CREATE INDEX IF NOT EXISTS idx_slots_student_id ON slots(student_id);
CREATE INDEX IF NOT EXISTS idx_slots_start_time ON slots(start_time);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);

-- Insert sample users for testing
INSERT INTO users (name, email, phone_number, user_type) VALUES
('Jane Doe', 'jane.doe@example.com', '555-123-4567', 'coach'),
('John Smith', 'john.smith@example.com', '555-987-6543', 'coach'),
('Alice Johnson', 'alice.johnson@example.com', '555-111-2222', 'student'),
('Bob Williams', 'bob.williams@example.com', '555-333-4444', 'student'),
('Carol Brown', 'carol.brown@example.com', '555-555-6666', 'student');

-- Insert sample slots for testing
INSERT INTO slots (coach_id, start_time, end_time, is_booked) VALUES
(1, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 2 hours', FALSE),
(1, NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 2 hours', FALSE),
(2, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 2 hours', FALSE),
(2, NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 2 hours', FALSE);

-- Insert sample booked slots with completed sessions
INSERT INTO slots (coach_id, student_id, start_time, end_time, is_booked, satisfaction_score, notes) VALUES
(1, 3, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days 2 hours', TRUE, 5, 'Great session! Student made significant progress.'),
(1, 4, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days 2 hours', TRUE, 4, 'Good session, but student needs to practice more.'),
(2, 5, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day 2 hours', TRUE, 4, 'Student is making steady progress.');
