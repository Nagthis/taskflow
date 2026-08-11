import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { ViewModeProvider } from './context/ViewModeContext';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import PerfilPage from './pages/PerfilPage';
import SupervisorPage from './pages/SupervisorPage';
import TareasPage from './pages/TareasPage';

export default function App() {
  return (
    <ThemeProvider>
      <ViewModeProvider>
        <AuthProvider>
          <DataProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/tareas" element={<TareasPage />} />
                  <Route path="/supervisor" element={<SupervisorPage />} />
                  <Route path="/perfil" element={<PerfilPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Router>
          </DataProvider>
        </AuthProvider>
      </ViewModeProvider>
    </ThemeProvider>
  );
}
