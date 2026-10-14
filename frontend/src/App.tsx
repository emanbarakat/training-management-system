import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Navbar } from '@/components/Navbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProgramsPage } from '@/pages/ProgramsPage';
import { TracksPage } from '@/pages/TracksPage';
import { StudentsPage } from '@/pages/StudentsPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/programs"
          element={
            <ProtectedRoute>
              <ProgramsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracks"
          element={
            <ProtectedRoute>
              <TracksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
