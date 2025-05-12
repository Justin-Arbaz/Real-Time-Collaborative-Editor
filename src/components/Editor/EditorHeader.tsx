import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentStore } from '../../store/documentStore';
import { ChevronLeft, Share, Clock, Save } from 'lucide-react';
import UserPresence from './UserPresence';
import { UserPresence as UserPresenceType } from '../../types';

interface EditorHeaderProps {
  activeUsers: UserPresenceType[];
}

const EditorHeader: React.FC<EditorHeaderProps> = ({ activeUsers }) => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { currentDocument, updateDocumentTitle, isSaving, lastSaved } = useDocumentStore();
  const [title, setTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState('editor');

  useEffect(() => {
    if (currentDocument) {
      setTitle(currentDocument.title);
    }
  }, [currentDocument]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (documentId && title !== currentDocument?.title && title.trim()) {
      updateDocumentTitle(documentId, title);
    } else if (!title.trim() && currentDocument) {
      setTitle(currentDocument.title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      if (currentDocument) {
        setTitle(currentDocument.title);
      }
      setIsEditingTitle(false);
    }
  };

  const handleShareDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (documentId && shareEmail.trim()) {
      // This would actually add the collaborator to the document
      // For now, we just close the modal
      setIsShareModalOpen(false);
      setShareEmail('');
    }
  };

  const formatLastSaved = (timestamp: string | null) => {
    if (!timestamp) return 'Not saved yet';
    
    const date = new Date(timestamp);
    return `Last saved at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/')}
            className="mr-4 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="border-b border-primary-500 bg-transparent text-lg font-medium text-gray-900 focus:outline-none"
              autoFocus
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="text-lg font-medium text-gray-900 cursor-pointer hover:text-primary-600"
            >
              {title || 'Untitled Document'}
            </h1>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center text-sm text-gray-500">
            {isSaving ? (
              <div className="flex items-center">
                <Save className="animate-pulse h-4 w-4 mr-1" />
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatLastSaved(lastSaved)}</span>
              </div>
            )}
          </div>
          
          <UserPresence users={activeUsers} />
          
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <Share className="h-4 w-4 mr-1.5" />
            <span>Share</span>
          </button>
        </div>
      </div>
      
      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" onClick={() => setIsShareModalOpen(false)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Share document</h3>
                
                <form onSubmit={handleShareDocument}>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="colleague@example.com"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Permission
                    </label>
                    <select
                      id="role"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={shareRole}
                      onChange={(e) => setShareRole(e.target.value)}
                    >
                      <option value="reader">Can view</option>
                      <option value="editor">Can edit</option>
                      <option value="admin">Can manage</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      onClick={() => setIsShareModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      disabled={!shareEmail.trim()}
                    >
                      Share
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorHeader;