
import type { StatusMessage } from '../hooks/useNote';

interface StatusIndicatorProps {
  status: StatusMessage | null;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  if (!status) return null;

  const getIcon = () => {
    switch (status.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      default:
        return 'i';
    }
  };

  const getColor = () => {
    switch (status.type) {
      case 'success':
        return 'var(--success-color)';
      case 'error':
        return 'var(--error-color)';
      default:
        return 'var(--info-color)';
    }
  };

  return (
    <div 
      className="status-indicator"
      style={{ borderColor: getColor(), color: getColor() }}
    >
      <span className="status-icon">{getIcon()}</span>
      <span className="status-message">{status.message}</span>
    </div>
  );
}
