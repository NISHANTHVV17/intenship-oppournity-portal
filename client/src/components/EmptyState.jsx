// Friendly message shown when a list has no items.

function EmptyState({ icon = 'bi-inbox', title, message, children }) {
  return (
    <div className="text-center py-5 text-muted">
      <i className={`bi ${icon} display-4 d-block mb-3`}></i>
      <h5 className="text-dark">{title}</h5>
      {message && <p className="mb-3">{message}</p>}
      {children}
    </div>
  );
}

export default EmptyState;
