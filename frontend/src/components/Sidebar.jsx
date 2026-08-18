import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiUsers,
  FiClock,
  FiUserPlus,
  FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/employees', label: 'Employees', icon: FiUsers },
  { to: '/attendance', label: 'Attendance', icon: FiClock },
  { to: '/attendance/mark', label: 'Mark Attendance', icon: FiUserPlus }
];

const Sidebar = ({ open, onClose }) => {
  const { logout } = useAuth();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col bg-gray-900 transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 border-b border-gray-800 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <FiClock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Attendance MS</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-800 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <FiLogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;