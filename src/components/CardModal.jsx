import { useState, useEffect, useRef } from 'react'
import './CardModal.css'
import { uploadImage } from '../lib/api'

function CardModal({ card, category, onSave, onDelete, onClose }) {
  const [label, setLabel] = useState('')
  const [imageUrl, setImageUrl] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)
  const isEditing = !!card

  useEffect(() => {
    setLabel(card?.label || '')
    setImageUrl(card?.image_url || null)
    setImageFile(null)
  }, [card])

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setImageFile(file)
    setImageUrl(URL.createObjectURL(file))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handlePaste = (e) => {
    const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image/'))
    if (item) handleFile(item.getAsFile())
  }

  const handleSave = async () => {
    if (!label.trim()) return
    setSaving(true)
    try {
      let finalImageUrl = imageUrl

      if (imageFile) {
        const ext = imageFile.name?.split('.').pop() || 'png'
        const path = `${category.id}/${Date.now()}.${ext}`
        finalImageUrl = await uploadImage(imageFile, path)
      }

      await onSave({ label, image_url: finalImageUrl })
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} onPaste={handlePaste}>

        <div className="modal-header">
          <span className="modal-title">{isEditing ? 'Edit card' : 'Add card'}</span>
          <button className="btn-icon-only btn-md" onClick={onClose} aria-label="Close">
            <i className="ti ti-x" />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-field">
            <label className="form-label">
              Label <span className="required">*</span>
            </label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Canada"
              value={label}
              onChange={e => setLabel(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-field">
            <label className="form-label">Image</label>
            {imageUrl ? (
              <div className="card-modal-preview">
                <img src={imageUrl} alt={label} />
                <button
                  className="card-modal-preview-remove btn-icon-only btn-md danger"
                  onClick={() => { setImageUrl(null); setImageFile(null) }}
                  aria-label="Remove image"
                >
                  <i className="ti ti-x" />
                </button>
              </div>
            ) : (
              <div
                className={`card-modal-dropzone ${dragging ? 'dragging' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                <i className="ti ti-photo-up" style={{ fontSize: '24px' }} />
                <span className="text-body-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  Drop an image here, or
                </span>
                <div className="card-modal-dropzone-actions">
                  <button
                    className="btn btn-secondary btn-md"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <i className="ti ti-upload" style={{ fontSize: '14px' }} />
                    Upload
                  </button>
                  <button
                    className="btn btn-secondary btn-md"
                    onClick={() => navigator.clipboard.read().then(items => {
                      for (const item of items) {
                        const type = item.types.find(t => t.startsWith('image/'))
                        if (type) item.getType(type).then(blob => handleFile(blob))
                      }
                    })}
                  >
                    <i className="ti ti-clipboard" style={{ fontSize: '14px' }} />
                    Paste
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => handleFile(e.target.files[0])}
                />
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {isEditing && (
            <button
              className="btn btn-danger btn-md"
              onClick={() => onDelete(card.id)}
              style={{ marginRight: 'auto' }}
            >
              <i className="ti ti-trash" style={{ fontSize: '14px' }} />
              Delete
            </button>
          )}
          <button className="btn btn-ghost btn-md" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary btn-md"
            onClick={handleSave}
            disabled={!label.trim() || saving}
          >
            {saving ? 'Saving...' : isEditing ? 'Save' : 'Add card'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default CardModal