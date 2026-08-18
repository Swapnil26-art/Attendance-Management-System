import { FiMenu, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ onMenuClick, title }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Open menu"
        >
          <FiMenu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <FiUser className="h-5 w-5" />
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-gray-800">
            {user?.full_name || 'Administrator'}
          </p>
          <p className="text-xs capitalize text-gray-500">{user?.role || 'admin'}</p>
        </div>
      </div>
    </header>
  );
};

export default Topbar;