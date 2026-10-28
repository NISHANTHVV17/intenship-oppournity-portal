// A simple Bootstrap-styled modal controlled by React state.
// Usage:
//   <Modal show={open} title="Hello" onClose={() => setOpen(false)} footer={<button>OK</button>}>
//     Body content
//   </Modal>

function Modal({ show, title, onClose, children, footer, size = '' }) {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop-custom" onClick={onClose}></div>
      <div className="modal d-block" tabIndex="-1" role="dialog" onClick={onClose}>
        {/* stopPropagation so clicks inside the box don't close the modal */}
        <div
          className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${size ? `modal-${size}` : ''}`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </>
  );
}

export default Modal;
