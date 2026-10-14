import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-blue-600">TMS</h1>
          <span className="text-sm text-gray-600">Training Management System</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-700 hover:text-blue-600"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/programs')}
              className="text-gray-700 hover:text-blue-600"
            >
              Programs
            </button>
            <button
              onClick={() => navigate('/tracks')}
              className="text-gray-700 hover:text-blue-600"
            >
              Tracks
            </button>
            <button
              onClick={() => navigate('/students')}
              className="text-gray-700 hover:text-blue-600"
            >
              Students
            </button>
          </nav>
          {user && (
            <>
              <div className="text-sm">
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-gray-500 capitalize text-xs">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-small flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t p-4 flex items-center justify-between">
          {user && (
            <>
              <div className="text-sm">
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-gray-500 capitalize text-xs">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-small flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
