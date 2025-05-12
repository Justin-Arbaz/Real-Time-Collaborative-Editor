import { create } from 'zustand';
import { Document, UserPresence, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from './authStore';

interface DocumentStore {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: string | null;
  activeUsers: UserPresence[];
  error: string | null;
  
  fetchDocuments: () => Promise<void>;
  fetchDocument: (id: string) => Promise<void>;
  createDocument: (title: string) => Promise<Document>;
  updateDocumentTitle: (id: string, title: string) => Promise<void>;
  saveDocument: (id: string, content: string) => Promise<void>;
  addCollaborator: (documentId: string, role: CollaboratorRole) => Promise<void>;
  updateActiveUsers: (users: UserPresence[]) => void;
}

// Update CollaboratorRole to match UserRole
type CollaboratorRole = UserRole; // Ensure this matches the UserRole type

// Mock data generation
const createMockDocument = (title: string, userId: string): Document => ({
  id: uuidv4(),
  title,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: userId,
  collaborators: [{ userId, role: 'admin' }],
});

const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Getting Started Guide',
    createdAt: '2023-01-15T12:00:00Z',
    updatedAt: '2023-01-15T14:30:00Z',
    createdBy: 'user1',
    collaborators: [{ userId: 'user1', role: 'admin' }],
  },
  {
    id: '2',
    title: 'Project Proposal',
    createdAt: '2023-02-20T09:15:00Z',
    updatedAt: '2023-02-22T16:45:00Z',
    createdBy: 'user1',
    collaborators: [
      { userId: 'user1', role: 'admin' },
      { userId: 'user2', role: 'editor' },
    ],
  },
];

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  currentDocument: null,
  isLoading: false,
  isSaving: false,
  lastSaved: null,
  activeUsers: [],
  error: null,
  
  fetchDocuments: async () => {
    try {
      set({ isLoading: true, error: null });
      await new Promise(resolve => setTimeout(resolve, 800));
      // Merge mockDocuments and any new documents created in this session (avoid duplicates by id)
      const state = get();
      const allDocs = [...mockDocuments, ...state.documents.filter(doc => !mockDocuments.some(md => md.id === doc.id))];
      set({ documents: allDocs, isLoading: false });
    } catch {
      set({ error: 'Failed to fetch documents', isLoading: false });
    }
  },
  
  fetchDocument: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      // Use get() to access the latest state
      const state = get();
      let document = state.documents.find(doc => doc.id === id) || null;
      // If not found in state, check mockDocuments (for initial demo docs)
      if (!document) {
        document = mockDocuments.find(doc => doc.id === id) || null;
      }
      set({ currentDocument: document, isLoading: false });
      return;
    } catch {
      set({ error: 'Failed to fetch document', isLoading: false });
    }
  },
  
  createDocument: async (title: string) => {
    try {
      set({ isLoading: true, error: null });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      // Get user ID from auth store
      const user = useAuthStore.getState().user;
      const userId = user?.id || 'user1';
      const newDocument = createMockDocument(title, userId);
      set(state => ({ 
        documents: [...state.documents, newDocument],
        isLoading: false 
      }));
      return newDocument;
    } catch {
      set({ error: 'Failed to create document', isLoading: false });
      throw new Error('Failed to create document');
    }
  },
  
  updateDocumentTitle: async (id: string, title: string) => {
    try {
      set({ isSaving: true, error: null });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        documents: state.documents.map(doc => 
          doc.id === id ? { ...doc, title, updatedAt: new Date().toISOString() } : doc
        ),
        currentDocument: state.currentDocument?.id === id 
          ? { ...state.currentDocument, title, updatedAt: new Date().toISOString() } 
          : state.currentDocument,
        isSaving: false,
        lastSaved: new Date().toISOString()
      }));
    } catch {
      set({ error: 'Failed to update document title', isSaving: false });
    }
  },
  
  saveDocument: async (id: string, content: string) => {
    try {
      set({ isSaving: true, error: null });
      // Validate if the document exists
      const documentExists = mockDocuments.some(doc => doc.id === id);
      if (!documentExists) {
        throw new Error(`Document with id ${id} does not exist.`);
      }
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate saving the content
      console.log(`Saving content for document ${id}:`, content);
      
      set({ 
        isSaving: false,
        lastSaved: new Date().toISOString()
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save document';
      set({ error: errorMessage, isSaving: false });
    }
  },
  
  addCollaborator: async (documentId: string, role: CollaboratorRole) => {
    try {
      set({ isLoading: true, error: null });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, we would add the collaborator on the server
      // For now, we'll just update the local state
      const userId = `user-${Math.floor(Math.random() * 1000)}`;
      
      set(state => ({
        documents: state.documents.map(doc => 
          doc.id === documentId 
            ? { 
                ...doc, 
                collaborators: [...doc.collaborators, { userId, role }], // Ensure role matches UserRole
                updatedAt: new Date().toISOString()
              } 
            : doc
        ),
        currentDocument: state.currentDocument?.id === documentId 
          ? { 
              ...state.currentDocument, 
              collaborators: [...state.currentDocument.collaborators, { userId, role }], // Ensure role matches UserRole
              updatedAt: new Date().toISOString()
            } 
          : state.currentDocument,
        isLoading: false
      }));
    } catch {
      set({ error: 'Failed to add collaborator', isLoading: false });
    }
  },
  
  updateActiveUsers: (users: UserPresence[]) => {
    set({ activeUsers: users });
  }
}));