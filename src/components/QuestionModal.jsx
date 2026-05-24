import { useState, useEffect } from 'react'
import './QuestionModal.css'
import { fetchSources, fetchCategories, fetchCards } from '../lib/api'

const TYPES = [
  { id: 'Q', label: 'Question' },
  { id: 'S', label: 'Skit' },
]

const PAIRS = [
  { id: 'TS', label: 'Teacher + Student' },
  { id: 'SS', label: 'Student + Student' },
]

function QuestionModal({ question, onSave, onDelete, onClose }) {
  const [type, setType] = useState('Q')
  const [pair, setPair] = useState('TS')
  const [question1, setQuestion1] = useState('')
  const [scaffold1, setScaffold1] = useState('')
  const [answer, setAnswer] = useState('')
  const [question2, setQuestion2] = useState('')
  const [scaffold2, setScaffold2] = useState('')
  const [saving, setSaving] = useState(false)

  const [sources, setSources] = useState([])
  const [pickerSource, setPickerSource] = useState(null)
  const [pickerCategories, setPickerCategories] = useState([])
  const [pickerCategory, setPickerCategory] = useState(null)
  const [pickerImages, setPickerImages] = useState([])
  const [selectedImages, setSelectedImages] = useState(Array(8).fill(null))

  const isEditing = !!question

  useEffect(() => {
    if (question) {
      const qtype = question.type === 'C' ? 'S' : question.type === 'A' || question.type === 'B' ? 'Q' : question.type
      setType(qtype || 'Q')
      setPair(question.pair || 'TS')
      setQuestion1(question.question || '')
      setScaffold1(question.scaffold || '')
      setAnswer(question.answer || '')
      setQuestion2(question.question2 || '')
      setScaffold2(question.scaffold2 || '')
      setSelectedImages(question.helper_images ? JSON.parse(question.helper_images) : Array(8).fill(null))
    } else {
      setType('Q')
      setPair('TS')
      setQuestion1('')
      setScaffold1('')
      setAnswer('')
      setQuestion2('')
      setScaffold2('')
      setSelectedImages(Array(8).fill(null))
    }
  }, [question])

  useEffect(() => {
    fetchSources().then(data => {
      setSources(data)
      if (data.length > 0) setPickerSource(data[0])
    })
  }, [])

  useEffect(() => {
    if (!pickerSource) return
    setPickerCategories([])
    setPickerCategory(null)
    setPickerImages([])
    fetchCategories(pickerSource.id).then(cats => {
      setPickerCategories(cats)
      if (cats.length > 0) setPickerCategory(cats[0])
    })
  }, [pickerSource?.id])

  useEffect(() => {
    if (!pickerCategory) return
    setPickerImages([])
    fetchCards(pickerCategory.id).then(setPickerImages)
  }, [pickerCategory?.id])

  const handleSelectImage = (img) => {
    setSelectedImages(prev => {
      const updated = [...prev]
      const emptyIndex = updated.findIndex(s => s === null)
      if (emptyIndex !== -1) updated[emptyIndex] = img
      return updated
    })
  }

  const handleClearSlot = (slotIndex) => {
    setSelectedImages(prev => prev.map((s, i) => i === slotIndex ? null : s))
  }

  const handleSave = async () => {
    if (!question1.trim()) return
    setSaving(true)
    try {
      await onSave({
        type,
        pair,
        question: question1,
        scaffold: scaffold1,
        answer: answer || null,
        question2: type === 'S' ? question2 : null,
        scaffold2: type === 'S' ? scaffold2 : null,
        image_url: null,
        helper_images: JSON.stringify(selectedImages),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal question-modal" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <span className="modal-title">{isEditing ? 'Edit question' : 'Add question'}</span>
          <button className="btn-icon-only btn-md" onClick={onClose} aria-label="Close">
            <i className="ti ti-x" />
          </button>
        </div>

        <div className="modal-body">

          {/* Type + Pair side by side */}
          <div className="question-modal-toggles-row">
            <div className="form-field" style={{ flex: 1 }}>
              <label className="form-label">Type</label>
              <div className="question-modal-toggle">
                {TYPES.map(t => (
                  <button
                    key={t.id}
                    className={`question-modal-toggle-btn ${type === t.id ? 'active' : ''}`}
                    onClick={() => setType(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-field" style={{ flex: 1 }}>
              <label className="form-label">Pair</label>
              <div className="question-modal-toggle">
                {PAIRS.map(p => (
                  <button
                    key={p.id}
                    className={`question-modal-toggle-btn ${pair === p.id ? 'active' : ''}`}
                    onClick={() => setPair(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question 1 */}
          <div className="form-field">
            <label className="form-label">{type === 'S' ? 'Question 1' : 'Question'}</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. How's the weather?"
              value={question1}
              onChange={e => setQuestion1(e.target.value)}
              rows={2}
              autoFocus
            />
          </div>

          {/* Scaffold + Answer side by side for Question type */}
          {type === 'Q' ? (
            <div className="question-modal-toggles-row">
              <div className="form-field" style={{ flex: 1 }}>
                <label className="form-label">Answer scaffold</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. It's ..."
                  value={scaffold1}
                  onChange={e => setScaffold1(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="form-field" style={{ flex: 1 }}>
                <label className="form-label">Answer <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. It's sunny."
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          ) : (
            <div className="form-field">
              <label className="form-label">Answer scaffold 1</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. I want to go to ..."
                value={scaffold1}
                onChange={e => setScaffold1(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Skit — Question 2 + Scaffold 2 */}
          {type === 'S' && (
            <>
              <div className="form-field">
                <label className="form-label">Question 2</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. Why do you want to go there?"
                  value={question2}
                  onChange={e => setQuestion2(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Answer scaffold 2</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. I want to ..."
                  value={scaffold2}
                  onChange={e => setScaffold2(e.target.value)}
                  rows={2}
                />
              </div>
            </>
          )}

          {/* Image picker */}
          <div className="form-field">
            <label className="form-label">Images <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(up to 8)</span></label>

            <div className="picker-dropdowns">
              <select
                className="form-input picker-select"
                value={pickerSource?.id || ''}
                onChange={e => {
                  const src = sources.find(s => s.id === e.target.value)
                  setPickerSource(src)
                }}
              >
                {sources.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <select
                className="form-input picker-select"
                value={pickerCategory?.id || ''}
                onChange={e => {
                  const cat = pickerCategories.find(c => c.id === e.target.value)
                  setPickerCategory(cat)
                }}
              >
                {pickerCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {pickerImages.length > 0 && (
              <div className="picker-grid">
                {pickerImages.map(img => (
                  <div
                    key={img.id}
                    className="picker-img-item"
                    onClick={() => handleSelectImage(img)}
                  >
                    <img src={img.image_url} alt={img.label} />
                    <span className="picker-img-label">{img.label}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="picker-slots">
              {(() => {
                const nextEmpty = selectedImages.findIndex(s => s === null)
                return selectedImages.map((img, i) => (
                  <div key={i} className={`picker-slot ${!img && i === nextEmpty ? 'picker-slot--next' : ''}`}>
                    {img ? (
                      <>
                        <img src={img.image_url} alt={img.label} />
                        <button
                          className="picker-slot-remove btn-icon-only btn-sm danger"
                          onClick={() => handleClearSlot(i)}
                          aria-label="Remove"
                        >
                          <i className="ti ti-x" />
                        </button>
                      </>
                    ) : (
                      <div className="picker-slot-empty">
                        <span>Slot {i + 1}</span>
                      </div>
                    )}
                  </div>
                ))
              })()}
            </div>
          </div>

        </div>

        <div className="modal-footer">
          {isEditing && (
            <button
              className="btn btn-danger btn-md"
              onClick={() => onDelete(question.id)}
              style={{ marginRight: 'auto' }}
            >
              <i className="ti ti-trash" style={{ fontSize: '16px' }} />
              Delete
            </button>
          )}
          <button className="btn btn-ghost btn-md" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary btn-md"
            onClick={handleSave}
            disabled={!question1.trim() || saving}
          >
            {saving ? 'Saving...' : isEditing ? 'Save' : 'Add question'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default QuestionModal