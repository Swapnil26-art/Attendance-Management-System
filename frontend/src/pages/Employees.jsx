import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiSearch,
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiChevronDown,
  FiRefreshCw
} from 'react-icons/fi';
import { employeeApi, departmentApi, extractError } from '../api';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const SORTS = [
  { value: 'e.created_at', label: 'Date Added' },
  { value: 'e.name', label: 'Name' },
  { value: 'e.employee_id', label: 'Employee ID' },
  { value: 'e.designation', label: 'Designation' },
  { value: 'd.name', label: 'Department' },
  { value: 'e.status', label: 'Status' }
];

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: '',
    sortBy: 'e.created_at',
    order: 'desc'
  });

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: pagination.limit };
      const res = await employeeApi.getAll(params);
      setEmployees(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(extractError(err, 'Failed to load employees'));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  useEffect(() => {
    load(1);
  }, [load]);

  useEffect(() => {
    departmentApi.getAll()
      .then((res) => setDepartments(res.data.data))
      .catch(() => {});
  }, []);

  const handlePageChange = (page) => load(page);

  const resetFilters = () => {
    setFilters({ search: '', department: '', status: '', sortBy: 'e.created_at', order: 'desc' });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employeeApi.remove(deleteTarget.id);
      toast.success('Employee deleted');
      setDeleteTarget(null);
      load(Math.max(1, pagination.page));
    } catch (err) {
      toast.error(extractError(err, 'Failed to delete employee'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-72">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && load(1)}
            placeholder="Search name, email, ID…"
            className="input-field pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="input-field w-44 appearance-none pr-8"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field w-32 appearance-none"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="input-field w-36 appearance-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <button
            onClick={() => setFilters({ ...filters, order: filters.order === 'asc' ? 'desc' : 'asc' })}
            className="btn-secondary"
            title="Toggle sort order"
          >
            {filters.order === 'asc' ? 'ASC ↑' : 'DESC ↓'}
          </button>

          <button onClick={resetFilters} className="btn-secondary px-3" title="Reset filters">
            <FiRefreshCw className="h-4 w-4" />
          </button>

          <button onClick={() => navigate('/employees/new')} className="btn-primary">
            <FiPlus className="h-4 w-4" /> Add Employee
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner />
        ) : employees.length === 0 ? (
          <EmptyState title="No employees found" description="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Employee ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Mobile</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Department</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Designation</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-medium text-blue-600">{emp.employee_id}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-800">{emp.name}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{emp.email}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{emp.mobile}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{emp.department_name}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{emp.designation}</td>
                    <td className="px-5 py-3"><Badge status={emp.status} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                          title="View"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/employees/${emp.id}/edit`)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-amber-50 hover:text-amber-600"
                          title="Edit"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(emp)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && employees.length > 0 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Employee"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} disabled={deleting} className="btn-danger">
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900">{deleteTarget?.name}</span> ({deleteTarget?.employee_id})?
          This will also remove their attendance records.
        </p>
      </Modal>
    </div>
  );
};

export default Employees;