const StatCard = ({ label, value, icon: Icon, color = 'blue', sub }) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
    teal: 'bg-teal-100 text-teal-600'
  };

  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorMap[color] || colorMap.blue}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>
    </div>
  );
};

export default StatCard;