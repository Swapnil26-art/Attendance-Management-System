const statusColors = {
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-600',
  Present: 'bg-green-100 text-green-700',
  Absent: 'bg-red-100 text-red-700',
  'Half-Day': 'bg-amber-100 text-amber-700',
  Late: 'bg-orange-100 text-orange-700'
};

const Badge = ({ status }) => {
  const classes = statusColors[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {status}
    </span>
  );
};

export default Badge;