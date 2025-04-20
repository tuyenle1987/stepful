import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  user_type: 'coach' | 'student';
}

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  users: User[];
  coaches: User[];
  students: User[];
  loading: boolean;
  switchUserType: () => void;
  switchUser: (userId: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [coaches, setCoaches] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`);
        setUsers(response.data);
        
        // Set coaches and students
        const coachList = response.data.filter((user: User) => user.user_type === 'coach');
        const studentList = response.data.filter((user: User) => user.user_type === 'student');
        
        setCoaches(coachList);
        setStudents(studentList);
        
        // Set default user (first coach)
        if (coachList.length > 0 && !currentUser) {
          setCurrentUser(coachList[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Switch between coach and student
  const switchUserType = () => {
    if (!currentUser) return;
    
    if (currentUser.user_type === 'coach' && students.length > 0) {
      setCurrentUser(students[0]);
    } else if (currentUser.user_type === 'student' && coaches.length > 0) {
      setCurrentUser(coaches[0]);
    }
  };

  // Switch to a specific user
  const switchUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        coaches,
        students,
        loading,
        switchUserType,
        switchUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};