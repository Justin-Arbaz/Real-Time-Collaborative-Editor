import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { WebrtcProvider } from 'y-webrtc';
import { useAuthStore } from '../store/authStore';
import EditorHeader from '../components/Editor/EditorHeader';
import { useDocumentStore } from '../store/documentStore';
import * as Y from 'yjs';

interface AwarenessUser {
  id: string;
  name: string;
  color: string;
}
interface AwarenessState {
  user?: AwarenessUser;
}

const EditorPage: React.FC = () => {
  const { documentId = '' } = useParams<{ documentId: string }>();
  const { fetchDocument, currentDocument, isSaving } = useDocumentStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Basic Yjs collaborative editor state
  const [basicContent, setBasicContent] = useState('');
  const [basicUsers, setBasicUsers] = useState<AwarenessUser[]>([]);
  const basicEditorRef = useRef<HTMLDivElement>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebrtcProvider | null>(null);
  const ytextRef = useRef<Y.Text | null>(null);
  const [basicReady, setBasicReady] = useState(false);

  // Fetch document from store
  useEffect(() => {
    const loadDocument = async () => {
      setIsLoading(true);
      await fetchDocument(documentId);
      setIsLoading(false);
    };
    if (documentId) {
      loadDocument();
    }
  }, [documentId, fetchDocument]);

  // Set up Yjs editor
  useEffect(() => {
    if (!currentDocument || !user) return;
    setBasicReady(false);
    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider(`basic-doc-${currentDocument.id}`, ydoc, {
      signaling: ['wss://signaling.yjs.dev'],
    });
    const ytext = ydoc.getText('content');
    ydocRef.current = ydoc;
    providerRef.current = provider;
    ytextRef.current = ytext;
    provider.awareness.setLocalStateField('user', {
      id: user.id,
      name: user.name,
      color: user.color,
    });
    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values()) as AwarenessState[];
      setBasicUsers(states.map(s => s.user).filter((u): u is AwarenessUser => Boolean(u)));
    };
    provider.awareness.on('change', updateUsers);
    updateUsers();
    const updateContent = () => {
      setBasicContent(ytext.toString());
      setBasicReady(true);
    };
    ytext.observe(updateContent);
    updateContent();
    return () => {
      ytext.unobserve(updateContent);
      provider.awareness.off('change', updateUsers);
      provider.destroy();
      ydoc.destroy();
    };
  }, [currentDocument, user]);

  const handleBasicInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText;
    ytextRef.current?.delete(0, ytextRef.current.length);
    ytextRef.current?.insert(0, text);
  };

  // Update document title in the HTML head
  useEffect(() => {
    if (currentDocument) {
      document.title = `${currentDocument.title} | TextCollab`;
    } else {
      document.title = 'Loading... | TextCollab';
    }
  }, [currentDocument]);

  // Auto-save feature: save content every 5 seconds if changed
  useEffect(() => {
    if (!currentDocument || !basicReady) return;
    let lastSavedContent = basicContent;
    const interval = setInterval(() => {
      if (basicContent !== lastSavedContent) {
        if (currentDocument.id && basicContent !== undefined) {
          useDocumentStore.getState().saveDocument(currentDocument.id, basicContent);
          lastSavedContent = basicContent;
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentDocument, basicContent, basicReady]);

  // Manual save handler
  const handleManualSave = () => {
    if (currentDocument && basicContent !== undefined) {
      useDocumentStore.getState().saveDocument(currentDocument.id, basicContent);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-pulse-slow flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-gray-500">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Document Not Found</h2>
          <p className="text-gray-700 mb-6">
            The document you're looking for doesn't exist or you don't have permission to access it.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show basic real-time collaborative editor after loading
  return (
    <div className="flex flex-col h-screen bg-white">
      <EditorHeader activeUsers={basicUsers.map(u => ({
        userId: u.id,
        name: u.name,
        color: u.color,
        lastActive: Date.now(),
      }))} />
      <div className="flex-1 overflow-auto px-4 md:px-0">
        <div className="max-w-4xl mx-auto my-8">
          {!basicReady ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="font-bold">Online:</span>
                {basicUsers.map(u => (
                  <span key={u.id} className="px-2 py-1 rounded text-white text-xs font-medium" style={{ background: u.color }}>
                    {u.name}
                  </span>
                ))}
                <button
                  onClick={handleManualSave}
                  className="ml-4 px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 text-xs font-medium disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
              <div
                ref={basicEditorRef}
                className="min-h-[200px] border border-primary-300 rounded bg-white p-4 outline-none focus:ring-2 focus:ring-primary-500"
                contentEditable
                suppressContentEditableWarning
                spellCheck={true}
                onInput={handleBasicInput}
                style={{ whiteSpace: 'pre-wrap' }}
                aria-label="Collaborative Editor"
                dir="ltr"
              >
                {basicContent}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorPage;