import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Home, LogOut, Settings, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-600">TextCollab</h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          <button 
            onClick={() => navigate('/')}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-md w-full ${
              isActive('/') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home className="mr-3 h-5 w-5" />
            Home
          </button>
          
          <button 
            onClick={() => navigate('/settings')}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-md w-full ${
              isActive('/settings') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </button>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="mt-4 flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 w-full"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
      
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-primary-600">TextCollab</h1>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="p-4 bg-white border-b border-gray-200 animate-fade-in">
            <nav className="space-y-2">
              <button 
                onClick={() => {
                  navigate('/');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md w-full ${
                  isActive('/') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="mr-3 h-5 w-5" />
                Home
              </button>
              
              <button 
                onClick={() => {
                  navigate('/settings');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md w-full ${
                  isActive('/settings') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </button>
              
              <button 
                onClick={handleLogout}
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 w-full"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </nav>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-0 md:pt-0 mt-16 md:mt-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;