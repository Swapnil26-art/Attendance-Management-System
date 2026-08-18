const { pool } = require('../config/db');

/**
 * GET /api/dashboard/stats
 * Returns all dashboard statistics
 */
const getStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Total employees
    const [totalResult] = await pool.execute('SELECT COUNT(*) as count FROM employees');
    const totalEmployees = totalResult[0].count;

    // Active employees
    const [activeResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM employees WHERE status = 'Active'"
    );
    const activeEmployees = activeResult[0].count;

    // Present today (includes Present, Late, Half-Day)
    const [presentResult] = await pool.execute(
      `SELECT COUNT(*) as count FROM attendance 
       WHERE attendance_date = ? AND status IN ('Present', 'Late', 'Half-Day')`,
      [today]
    );
    const presentToday = presentResult[0].count;

    // Absent today = Active employees - Present today
    const absentToday = activeEmployees - presentToday;

    // Department-wise employee count
    const [departmentWise] = await pool.execute(
      `SELECT d.name as department, COUNT(e.id) as count 
       FROM departments d 
       LEFT JOIN employees e ON d.id = e.department_id 
       GROUP BY d.id, d.name 
       ORDER BY count DESC`
    );

    // Recent attendance (last 5 records)
    const [recentAttendance] = await pool.execute(
      `SELECT a.*, e.name as employee_name, e.employee_id as emp_code
       FROM attendance a 
       JOIN employees e ON a.employee_id = e.id 
       ORDER BY a.created_at DESC 
       LIMIT 5`
    );

    // Attendance trend - last 7 days
    const [attendanceTrend] = await pool.execute(
      `SELECT 
        attendance_date as date,
        SUM(CASE WHEN status IN ('Present', 'Late', 'Half-Day') THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent
       FROM attendance 
       WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY attendance_date 
       ORDER BY attendance_date ASC`
    );

    res.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        presentToday,
        absentToday: absentToday < 0 ? 0 : absentToday,
        departmentWiseCount: departmentWise,
        recentAttendance,
        attendanceTrend
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };
