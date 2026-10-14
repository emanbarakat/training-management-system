import { useAuthStore } from '@/store/authStore';
import { BarChart3, Users, BookOpen, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Programs', icon: BookOpen, path: '/programs', roles: ['training_manager', 'admin'] },
    { label: 'Tracks', icon: Calendar, path: '/tracks', roles: ['training_manager', 'admin'] },
    { label: 'Students', icon: Users, path: '/students', roles: ['student_affairs', 'training_manager', 'admin'] },
    { label: 'Attendance', icon: Calendar, path: '/attendance', roles: ['student_affairs', 'admin'] },
    { label: 'Grades', icon: FileText, path: '/grades', roles: ['instructor', 'admin'] },
    { label: 'Reports', icon: BarChart3, path: '/reports', roles: ['training_manager', 'instructor', 'admin'] },
  ];

  const userMenuItems = menuItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome, {user?.firstName}!
        </h1>
        <p className="text-gray-600">Manage your training programs and students</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="card hover:shadow-lg hover:scale-105 transition-transform text-left cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-4 rounded-lg">
                  <Icon className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{item.label}</h3>
                  <p className="text-sm text-gray-500">Manage {item.label.toLowerCase()}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
