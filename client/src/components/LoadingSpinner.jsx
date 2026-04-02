export function LoadingSpinner({ size = 'md' }) {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  return (
    <div className="flex justify-center items-center p-4">
      <div className={`${sizeClass} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`} />
    </div>
  );
}
