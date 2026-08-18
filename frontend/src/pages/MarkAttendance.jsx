import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { attendanceApi, employeeApi, extractError } from '../api';
import Spinner from '../components/Spinner';

const STATUS_OPTIONS = ['Present', 'Absent', 'Half-Day', 'Late'];

const today = () => new Date().toISOString().split('T')[0];

const MarkAttendance = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    employee_id: '',
    attendance_date: today(),
    status: 'Present',
    check_in_time: '09:00',
    check_out_time: '17:00'
  });

  useEffect(() => {
    employeeApi.getAll({ limit: 100 })
      .then((res) => setEmployees(res.data.data))
      .catch(() => toast.error('Failed to load employees'))
      .finally(() => setLoadingEmployees(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employee_id || !form.attendance_date) {
      toast.error('Please select an employee and date');
      return;
    }
    setSaving(true);
    try {
      await attendanceApi.mark({
        employee_id: Number(form.employee_id),
        attendance_date: form.attendance_date,
        status: form.status,
        check_in_time: form.check_in_time || null,
        check_out_time: form.check_out_time || null
      });
      toast.success('Attendance marked successfully');
      setForm({ ...form, employee_id: '' });
    } catch (err) {
      toast.error(extractError(err, 'Failed to mark attendance'));
    } finally {
      setSaving(false);
    }
  };

  if (loadingEmployees) return <Spinner />;

  const activeEmployees = employees.filter((e) => e.status === 'Active');

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/attendance')}
          className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50"
          aria-label="Back"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">Mark Attendance</h2>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Employee <span className="text-red-500">*</span>
          </label>
          <select
            name="employee_id"
            value={form.employee_id}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select employee</option>
            {activeEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.employee_id} — {emp.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Attendance Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="attendance_date"
            value={form.attendance_date}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="input-field">
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Check-In Time</label>
            <input
              type="time"
              name="check_in_time"
              value={form.check_in_time}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Check-Out Time</label>
            <input
              type="time"
              name="check_out_time"
              value={form.check_out_time}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
          <button type="button" onClick={() => navigate('/attendance')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            <FiSave className="h-4 w-4" />
            {saving ? 'Saving…' : 'Mark Attendance'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarkAttendance;