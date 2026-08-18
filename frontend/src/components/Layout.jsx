import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const titles = {
  '/': 'Dashboard',
  '/employees': 'Employee Management',
  '/employees/new': 'Add Employee',
  '/attendance': 'Attendance Records',
  '/attendance/mark': 'Mark Attendance'
};

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = titles[location.pathname] || 'Dashboard';

  return (
    <div className="min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;