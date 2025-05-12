import { create } from 'zustand';
import { AuthState, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Function to generate a random color
const getRandomColor = (): string => {
  const colors = [
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#EF4444', // red
    '#F97316', // orange
    '#F59E0B', // amber
    '#10B981', // emerald
    '#14B8A6', // teal
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// In a real app, these functions would make API calls
const mockLogin = async (email: string, password: string): Promise<User> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo purposes, just return a mock user
  return {
    id: uuidv4(),
    name: email.split('@')[0],
    email,
    color: getRandomColor(),
    isOnline: true,
    createdAt: new Date().toISOString(),
  };
};

const mockRegister = async (name: string, email: string, password: string): Promise<User> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo purposes, just return a mock user
  return {
    id: uuidv4(),
    name,
    email,
    color: getRandomColor(),
    isOnline: true,
    createdAt: new Date().toISOString(),
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const user = await mockLogin(email, password);
      set({ user, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ error: 'Failed to login', loading: false });
    }
  },
  
  register: async (name: string, email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const user = await mockRegister(name, email, password);
      set({ user, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ error: 'Failed to register', loading: false });
    }
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));