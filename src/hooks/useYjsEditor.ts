import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { QuillBinding } from 'y-quill';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import { useAuthStore } from '../store/authStore';
import { useDocumentStore } from '../store/documentStore';
import { UserPresence } from '../types';

Quill.register('modules/cursors', QuillCursors);

interface UseYjsEditorProps {
  documentId: string;
  container: React.RefObject<HTMLDivElement>;
  onActiveUsersChange?: (users: UserPresence[]) => void;
}

interface EditorInstance {
  quill: Quill;
  doc: Y.Doc;
  provider: WebrtcProvider;
  binding: QuillBinding;
}

const useYjsEditor = ({ documentId, container, onActiveUsersChange }: UseYjsEditorProps) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<EditorInstance | null>(null);
  const { user } = useAuthStore();
  const { saveDocument } = useDocumentStore();

  // Initialize editor
  useEffect(() => {
    if (!container.current || !documentId || !user || editorRef.current) return;

    try {
      // Set up Yjs document and provider
      const ydoc = new Y.Doc();
      const provider = new WebrtcProvider(`textcollab-document-${documentId}`, ydoc, {
        signaling: ['wss://signaling.yjs.dev'],
      });

      // Configure user awareness
      provider.awareness.setLocalStateField('user', {
        name: user.name,
        color: user.color,
        id: user.id,
      });

      // Initialize Quill editor
      const quill = new Quill(container.current, {
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ align: [] }],
            ['link', 'image'],
            ['clean'],
          ],
          cursors: {
            transformOnTextChange: true,
          },
        },
        placeholder: 'Start writing...',
        theme: 'snow',
      });

      // Set up the cursors
      const cursors = quill.getModule('cursors');

      // Connect Yjs and Quill
      const ytext = ydoc.getText('quill');
      const binding = new QuillBinding(ytext, quill, provider.awareness);

      // Set up awareness handling
      provider.awareness.on('change', () => {
        // Get all connected clients except ourselves
        const states = provider.awareness.getStates() as Map<number, { user: any, cursor?: any }>;
        const activeUsers: UserPresence[] = [];

        states.forEach((state, clientId) => {
          if (state.user) {
            activeUsers.push({
              userId: state.user.id,
              name: state.user.name,
              color: state.user.color,
              selection: state.cursor ? {
                index: state.cursor.index,
                length: state.cursor.length,
              } : undefined,
              lastActive: Date.now(),
            });
          }
        });

        // Update active users in UI
        if (onActiveUsersChange) {
          onActiveUsersChange(activeUsers);
        }
      });

      // Save reference
      editorRef.current = {
        quill,
        doc: ydoc,
        provider,
        binding,
      };

      // Setup auto-save every 3 seconds
      const autoSaveInterval = setInterval(() => {
        if (editorRef.current) {
          const content = editorRef.current.quill.getContents();
          saveDocument(documentId, content);
        }
      }, 3000);

      setIsReady(true);

      // Cleanup function
      return () => {
        clearInterval(autoSaveInterval);
        if (editorRef.current) {
          editorRef.current.binding.destroy();
          editorRef.current.provider.disconnect();
          editorRef.current.doc.destroy();
          editorRef.current = null;
        }
      };
    } catch (err) {
      console.error('Error initializing Yjs editor:', err);
      setError('Failed to initialize the collaborative editor');
    }
  }, [container, documentId, user, onActiveUsersChange, saveDocument]);

  return {
    isReady,
    error,
    getEditor: () => editorRef.current?.quill,
    getDoc: () => editorRef.current?.doc,
  };
};

export default useYjsEditor;