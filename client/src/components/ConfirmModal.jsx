// "Are you sure?" dialog used before deleting or withdrawing.

import Modal from './Modal';

function ConfirmModal({
  show,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      show={show}
      title={title}
      onClose={loading ? () => {} : onCancel}
      footer={
        <>
          <button className="btn btn-outline-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className={`btn btn-${confirmVariant}`} onClick={onConfirm} disabled={loading}>
            {loading && <span className="spinner-border spinner-border-sm me-2"></span>}
            {confirmText}
          </button>
        </>
      }
    >
      <p className="mb-0">{message}</p>
    </Modal>
  );
}

export default ConfirmModal;
