const EmptyState = ({ title = 'No records found', description }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
    </div>
    <h3 className="text-base font-medium text-gray-700">{title}</h3>
    {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
  </div>
);

export default EmptyState;