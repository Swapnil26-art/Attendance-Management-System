import { useEffect, useState, useCallback } from 'react';
import { FiUsers, FiUserCheck, FiUserPlus, FiUserMinus } from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from 'recharts';
import toast from 'react-hot-toast';
import { dashboardApi } from '../api';
import { extractError } from '../api';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getStats();
      setStats(res.data.data);
    } catch (err) {
      toast.error(extractError(err, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Spinner />;

  const trendData = (stats?.attendanceTrend || []).map((t) => ({
    date: t.date,
    Present: t.present,
    Absent: t.absent
  }));

  const deptData = (stats?.departmentWiseCount || []).map((d) => ({
    name: d.department,
    Employees: d.count
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Employees" value={stats?.totalEmployees ?? 0} icon={FiUsers} color="blue" />
        <StatCard label="Active Employees" value={stats?.activeEmployees ?? 0} icon={FiUserCheck} color="green" />
        <StatCard label="Present Today" value={stats?.presentToday ?? 0} icon={FiUserPlus} color="teal" />
        <StatCard label="Absent Today" value={stats?.absentToday ?? 0} icon={FiUserMinus} color="red" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-base font-semibold text-gray-800">
            By Departments
          </h3>
          {deptData.length === 0 ? (
            <EmptyState title="No departments yet" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="Employees" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-base font-semibold text-gray-800">
            Attendance Trend (Last 7 Days)
          </h3>
          {trendData.length === 0 ? (
            <EmptyState title="No attendance data yet" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Present" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Absent" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="border-b border-gray-200 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-800">Recent Attendance</h3>
        </div>
        {stats?.recentAttendance?.length === 0 ? (
          <EmptyState title="No recent attendance records" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Employee</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Employee ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats?.recentAttendance?.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-medium text-gray-800">{a.employee_name}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{a.emp_code}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{a.attendance_date}</td>
                    <td className="px-5 py-3"><Badge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;