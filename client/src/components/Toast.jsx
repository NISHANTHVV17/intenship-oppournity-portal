// A single toast notification (rendered by ToastContext).

const ICONS = {
  success: 'bi-check-circle-fill',
  danger: 'bi-x-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  info: 'bi-info-circle-fill',
};

function Toast({ message, type = 'success', onClose }) {
  return (
    <div className={`alert alert-${type} shadow-sm d-flex align-items-start gap-2 mb-2`} role="alert">
      <i className={`bi ${ICONS[type] || ICONS.info} mt-1`}></i>
      <div className="flex-grow-1">{message}</div>
      <button type="button" className="btn-close btn-sm" aria-label="Close" onClick={onClose}></button>
    </div>
  );
}

export default Toast;
