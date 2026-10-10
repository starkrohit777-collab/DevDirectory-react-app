import { useState } from 'react';

export default function AlertBanner({ type = 'error', message, onRetry }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className={`alert alert-${type}`} role="alert">
      <span>{message}</span>
      <div className="alert-actions">
        {onRetry && <button className="btn btn-small" onClick={onRetry}>Retry</button>}
        <button className="icon-btn" aria-label="Dismiss" onClick={() => setOpen(false)}>×</button>
      </div>
    </div>
  );
}
