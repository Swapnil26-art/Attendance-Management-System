import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiDownload, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { attendanceApi, employeeApi, extractError } from '../api';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';

const STATUS_OPTIONS = ['Present', 'Absent', 'Half-Day', 'Late'];

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [filters, setFilters] = useState({
    from: '',
    to: '',
    employee: '',
    status: ''
  });

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        ...(filters.from && { from: filters.from }),
        ...(filters.to && { to: filters.to }),
        ...(filters.employee && { employee_id: filters.employee }),
        ...(filters.status && { status: filters.status })
      };
      const res = await attendanceApi.getAll(params);
      setRecords(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(extractError(err, 'Failed to load attendance'));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  useEffect(() => {
    load(1);
  }, [load]);

  useEffect(() => {
    attendanceApi.summary({
      ...(filters.from && { from: filters.from }),
      ...(filters.to && { to: filters.to }),
      ...(filters.status && { status: filters.status })
    })
      .then((res) => setSummary(res.data.data))
      .catch(() => {});

    employeeApi.getAll({ limit: 100 })
      .then((res) => setEmployees(res.data.data))
      .catch(() => {});
  }, [filters.from, filters.to, filters.status]);

  const resetFilters = () => setFilters({ from: '', to: '', employee: '', status: '' });

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        ...(filters.from && { from: filters.from }),
        ...(filters.to && { to: filters.to }),
        ...(filters.employee && { employee_id: filters.employee })
      };
      const res = await attendanceApi.exportCsv(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch (err) {
      toast.error(extractError(err, 'Export failed'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:gap-3">
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            className="input-field lg:w-40"
            title="From date"
          />
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            className="input-field lg:w-40"
            title="To date"
          />
          <select
            value={filters.employee}
            onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
            className="input-field lg:w-44"
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field lg:w-36"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={resetFilters} className="btn-secondary px-3" title="Reset filters">
            <FiRefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={handleExport} disabled={exporting} className="btn-secondary">
            <FiDownload className="h-4 w-4" /> {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
          <Link to="/attendance/mark" className="btn-primary">
            <FiPlus className="h-4 w-4" /> Mark Attendance
          </Link>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
          <span className="text-gray-500">Summary:</span>
          <span className="font-medium text-green-600">Present: {summary?.present ?? 0}</span>
          <span className="font-medium text-red-600">Absent: {summary?.absent ?? 0}</span>
          <span className="font-medium text-amber-600">Half-Day: {summary?.halfDay ?? 0}</span>
          <span className="font-medium text-orange-600">Late: {summary?.late ?? 0}</span>
          <span className="font-medium text-gray-700">Total: {summary?.total ?? 0}</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner />
        ) : records.length === 0 ? (
          <EmptyState title="No attendance records" description="Try adjusting your filters or mark attendance." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Employee</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Employee ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Department</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Check In</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Check Out</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-semibold text-gray-800">{a.employee_name}</td>
                    <td className="px-5 py-3 text-sm text-blue-600">{a.emp_code}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{a.department_name}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{a.attendance_date}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{a.check_in_time || '—'}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{a.check_out_time || '—'}</td>
                    <td className="px-5 py-3"><Badge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && records.length > 0 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={load}
          />
        )}
      </div>
    </div>
  );
};

export default Attendance;