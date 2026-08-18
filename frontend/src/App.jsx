import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeForm from './pages/EmployeeForm';
import EmployeeDetail from './pages/EmployeeDetail';
import Attendance from './pages/Attendance';
import MarkAttendance from './pages/MarkAttendance';
import NotFound from './pages/NotFound';

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/new" element={<EmployeeForm />} />
        <Route path="/employees/:id/edit" element={<EmployeeForm />} />
        <Route path="/employees/:id" element={<EmployeeDetail />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/attendance/mark" element={<MarkAttendance />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;