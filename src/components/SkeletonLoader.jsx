export default function SkeletonLoader({ count = 6, variant = 'card' }) {
  return (
    <div className={variant === 'card' ? 'grid' : 'stack'} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card">
          <div className="sk sk-circle" /><div className="sk sk-line" /><div className="sk sk-line short" />
        </div>
      ))}
    </div>
  );
}
