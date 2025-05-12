import React, { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { useAuthStore } from '../store/authStore';

interface Presence {
  id: string;
  name: string;
  color: string;
}

const getRandomColor = () => {
  const colors = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F97316', '#F59E0B', '#10B981', '#14B8A6',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

interface AwarenessState {
  user: Presence | null;
}

const BasicRealtimeEditor: React.FC = () => {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [users, setUsers] = useState<Presence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebrtcProvider | null>(null);
  const ytextRef = useRef<Y.Text | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    let didCancel = false;
    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider('basic-demo-room', ydoc, {
      signaling: ['wss://signaling.yjs.dev'],
    });
    const ytext = ydoc.getText('content');
    ydocRef.current = ydoc;
    providerRef.current = provider;
    ytextRef.current = ytext;

    // Awareness for user presence
    provider.awareness.setLocalStateField('user', {
      id: user.id,
      name: user.name,
      color: user.color || getRandomColor(),
    });
    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values()) as AwarenessState[];
      setUsers(states.map(s => s.user).filter((user): user is Presence => Boolean(user)));
    };
    provider.awareness.on('change', updateUsers);
    updateUsers();

    // Sync content
    const updateContent = () => {
      if (!didCancel) {
        setContent(ytext.toString());
        setIsLoading(false);
      }
    };
    ytext.observe(updateContent);
    updateContent();

    return () => {
      didCancel = true;
      ytext.unobserve(updateContent);
      provider.awareness.off('change', updateUsers);
      provider.destroy();
      ydoc.destroy();
    };
  }, [user]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText;
    ytextRef.current?.delete(0, ytextRef.current.length);
    ytextRef.current?.insert(0, text);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-gray-500">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="font-bold">Online:</span>
        {users.map(u => (
          <span key={u.id} className="px-2 py-1 rounded text-white text-xs font-medium" style={{ background: u.color }}>
            {u.name}
          </span>
        ))}
      </div>
      <div
        ref={editorRef}
        className="min-h-[200px] border border-primary-300 rounded bg-white p-4 outline-none focus:ring-2 focus:ring-primary-500"
        contentEditable
        suppressContentEditableWarning
        spellCheck={true}
        onInput={handleInput}
        style={{ whiteSpace: 'pre-wrap' }}
        aria-label="Collaborative Editor"
      >
        {content}
      </div>
    </div>
  );
};

export default BasicRealtimeEditor;
