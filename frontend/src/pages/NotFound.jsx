import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
    <p className="text-7xl font-bold text-blue-600">404</p>
    <h1 className="mt-2 text-xl font-semibold text-gray-800">Page not found</h1>
    <p className="mt-1 text-sm text-gray-500">The page you are looking for doesn't exist.</p>
    <Link to="/" className="btn-primary mt-6">Go to Dashboard</Link>
  </div>
);

export default NotFound;