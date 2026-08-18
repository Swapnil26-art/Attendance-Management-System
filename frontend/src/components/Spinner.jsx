const Spinner = ({ size = 'h-8 w-8' }) => (
  <div className="flex items-center justify-center p-10">
    <div
      className={`${size} animate-spin rounded-full border-4 border-blue-200 border-t-blue-600`}
    />
  </div>
);

export default Spinner;