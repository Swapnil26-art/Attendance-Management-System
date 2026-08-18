import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiMail, FiPhone, FiEdit, FiBriefcase, FiUser } from 'react-icons/fi';
import { employeeApi, attendanceApi, extractError } from '../api';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([employeeApi.getById(id), attendanceApi.getByEmployee(id)])
      .then(([empRes, attRes]) => {
        if (mounted) setData({ ...empRes.data.data, ...attRes.data.data });
      })
      .catch((err) => {
        toast.error(extractError(err, 'Failed to load employee'));
        navigate('/employees');
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [id, navigate]);

  if (loading) return <Spinner />;

  const { name, employee_id, email, mobile, department_name, designation, status, attendance = [], summary = {} } = data;

  const infoRows = [
    { label: 'Employee ID', value: employee_id, icon: FiUser },
    { label: 'Email', value: email, icon: FiMail },
    { label: 'Mobile', value: mobile, icon: FiPhone },
    { label: 'Department', value: department_name, icon: FiBriefcase },
    { label: 'Designation', value: designation, icon: FiBriefcase }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/employees')}
            className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50"
            aria-label="Back"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-800">
              {name} <Badge status={status} />
            </h2>
            <p className="text-sm text-gray-500">{employee_id} · {designation}</p>
          </div>
        </div>
        <button onClick={() => navigate(`/employees/${id}/edit`)} className="btn-primary">
          <FiEdit className="h-4 w-4" /> Edit
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <StatCard label="Present" value={summary.present || 0} color="green" />
        <StatCard label="Absent" value={summary.absent || 0} color="red" />
        <StatCard label="Half Day" value={summary.halfDay || 0} color="amber" />
        <StatCard label="Late" value={summary.late || 0} color="orange" />
        <StatCard label="Total Records" value={attendance.length || 0} color="blue" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-800">Contact Information</h3>
          <div className="space-y-3">
            {infoRows.map((row) => (
              <div key={row.label} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                  <row.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">{row.label}</p>
                  <p className="text-sm text-gray-800">{row.value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="border-b border-gray-200 px-5 py-4">
            <h3 className="text-base font-semibold text-gray-800">Attendance History</h3>
          </div>
          {attendance.length === 0 ? (
            <EmptyState title="No attendance records yet" />
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Check In</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Check Out</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendance.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-sm text-gray-800">{a.attendance_date}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{a.check_in_time || '—'}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{a.check_out_time || '—'}</td>
                      <td className="px-5 py-3"><Badge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;