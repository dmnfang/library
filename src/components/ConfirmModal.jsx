import './ConfirmModal.css'

function ConfirmModal({ title, message, onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn-icon-only btn-md" onClick={onClose} aria-label="Close">
            <i className="ti ti-x" />
          </button>
        </div>
        <div className="modal-body">
          <p className="confirm-modal-body" dangerouslySetInnerHTML={{ __html: message }} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-md" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger btn-md" onClick={onConfirm}>
            <i className="ti ti-trash" style={{ fontSize: '16px' }} />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal