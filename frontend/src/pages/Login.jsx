import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiClock, FiUser, FiLock, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { extractError } from '../api';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Login successful');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(extractError(err, 'Invalid username or password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <FiClock className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Attendance Management</h1>
            <p className="text-sm text-blue-100">Sign in to your account</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="relative">
                <FiUser className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter username"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <FiLock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              <FiLogIn className="h-5 w-5" />
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-blue-100">
          Default credentials: <span className="font-semibold">admin / admin123</span>
        </p>
      </div>
    </div>
  );
};

export default Login;