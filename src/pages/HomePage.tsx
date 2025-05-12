import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentStore } from '../store/documentStore';
import { useAuthStore } from '../store/authStore';
import { FileText, Plus, Clock, MoreHorizontal, Search } from 'lucide-react';

const HomePage: React.FC = () => {
  const { documents, fetchDocuments, createDocument, isLoading } = useDocumentStore();
  useAuthStore(); // Call the hook without destructuring if no properties are used
  const navigate = useNavigate();
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;
    
    try {
      const doc = await createDocument(newDocTitle);
      setNewDocTitle('');
      setIsCreatingDoc(false);
      navigate(`/document/${doc.id}`);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'} available
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <button
            onClick={() => setIsCreatingDoc(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 whitespace-nowrap"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Document
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              onClick={() => navigate(`/document/${doc.id}`)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded bg-primary-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary-600" />
                  </div>
                  <button 
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add document menu functionality here
                    }}
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{doc.title}</h3>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span>{formatDate(doc.updatedAt)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {doc.collaborators.slice(0, 3).map((collaborator) => (
                      <div
                        key={collaborator.userId}
                        className="h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center text-xs text-white ring-2 ring-white"
                        title={`User ${collaborator.userId}`}
                      >
                        {collaborator.userId.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {doc.collaborators.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 ring-2 ring-white">
                        +{doc.collaborators.length - 3}
                      </div>
                    )}
                  </div>
                  
                  <span className="text-xs text-gray-500">
                    {doc.collaborators.length} {doc.collaborators.length === 1 ? 'member' : 'members'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
            <FileText className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="mt-6 text-lg font-medium text-gray-900">
            {searchQuery ? 'No documents found' : 'No documents yet'}
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            {searchQuery
              ? `No documents match your search "${searchQuery}". Try a different search term.`
              : 'Create your first document to get started with collaborative editing.'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsCreatingDoc(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Document
            </button>
          </div>
        </div>
      )}
      
      {/* Create Document Modal */}
      {isCreatingDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Document</h2>
            <form onSubmit={handleCreateDocument}>
              <div className="mb-4">
                <label htmlFor="document-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Document Title
                </label>
                <input
                  id="document-title"
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="Enter document title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingDoc(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  disabled={!newDocTitle.trim()}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;