// User types
export interface User {
  id: string;
  name: string;
  email: string;
  color: string;
  isOnline: boolean;
  createdAt: string;
}

export type UserRole = 'reader' | 'editor' | 'admin';

export interface UserPresence {
  userId: string;
  name: string;
  color: string;
  selection?: {
    index: number;
    length: number;
  };
  lastActive: number;
}

// Document types
export interface Document {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  collaborators: Array<{
    userId: string;
    role: UserRole;
  }>;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  createdAt: string;
  createdBy: string;
  snapshot: any; // Yjs document data
}

export interface DocumentComment {
  id: string;
  documentId: string;
  userId: string;
  text: string;
  position: number;
  createdAt: string;
  resolved: boolean;
}

// Auth types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Editor types
export interface EditorState {
  document: Document | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: string | null;
  activeUsers: UserPresence[];
  error: string | null;
}