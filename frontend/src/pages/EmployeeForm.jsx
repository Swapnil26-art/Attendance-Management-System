import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { employeeApi, departmentApi, extractError } from '../api';
import Spinner from '../components/Spinner';

const initialForm = {
  employee_id: '',
  name: '',
  email: '',
  mobile: '',
  department_id: '',
  designation: '',
  status: 'Active'
};

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    departmentApi.getAll()
      .then((res) => setDepartments(res.data.data))
      .catch(() => {});

    if (isEdit) {
      employeeApi.getById(id)
        .then((res) => {
          const e = res.data.data;
          setForm({
            employee_id: e.employee_id,
            name: e.name,
            email: e.email,
            mobile: e.mobile,
            department_id: e.department_id,
            designation: e.designation,
            status: e.status
          });
        })
        .catch((err) => {
          toast.error(extractError(err, 'Failed to load employee'));
          navigate('/employees');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employee_id || !form.name || !form.email || !form.mobile || !form.department_id || !form.designation) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, department_id: Number(form.department_id) };
      if (isEdit) {
        await employeeApi.update(id, payload);
        toast.success('Employee updated successfully');
      } else {
        await employeeApi.create(payload);
        toast.success('Employee created successfully');
      }
      navigate('/employees');
    } catch (err) {
      toast.error(extractError(err, 'Failed to save employee'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/employees')}
          className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50"
          aria-label="Back"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          {isEdit ? 'Edit Employee' : 'Add New Employee'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Employee ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="employee_id"
              value={form.employee_id}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. EMP001"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. john@company.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. 9876543210"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              name="department_id"
              value={form.department_id}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Designation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="designation"
              value={form.designation}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. Software Engineer"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="input-field"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
          <button type="button" onClick={() => navigate('/employees')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            <FiSave className="h-4 w-4" />
            {saving ? 'Saving…' : isEdit ? 'Update Employee' : 'Save Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;