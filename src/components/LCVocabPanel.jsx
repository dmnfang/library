import { useState, useEffect } from 'react'
import './LCVocabPanel.css'
import { addLCVocab, deleteLCVocab, fetchSources, fetchCategories, fetchCards } from '../lib/api'

function LCVocabPanel({ mode, initialVocab, onVocabChange, onClose }) {
  const [vocab, setVocab] = useState(initialVocab || [])
  const [sources, setSources] = useState([])
  const [pickerSource, setPickerSource] = useState(null)
  const [pickerCategories, setPickerCategories] = useState([])
  const [pickerCategory, setPickerCategory] = useState(null)
  const [pickerImages, setPickerImages] = useState([])

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
    fetchCards(pickerCategory.id).then(setPickerImages)
  }, [pickerCategory?.id])

  const handleAdd = async (img) => {
    const already = vocab.find(v => v.image_url === img.image_url)
    if (already) return
    const newV = await addLCVocab(mode.id, img.label, img.image_url, vocab.length)
    const updated = [...vocab, newV]
    setVocab(updated)
    onVocabChange(updated)
  }

  const handleDelete = async (id) => {
    await deleteLCVocab(id)
    const updated = vocab.filter(v => v.id !== id)
    setVocab(updated)
    onVocabChange(updated)
  }

  return (
    <div className="lc-panel-overlay" onClick={onClose}>
      <div className="lc-panel" onClick={e => e.stopPropagation()}>
        <div className="lc-panel-header">
          <span className="lc-panel-title">{mode.name} — Vocab</span>
          <button className="btn-icon-only btn-md" onClick={onClose}>
            <i className="ti ti-x" />
          </button>
        </div>
        <div className="lc-panel-body">
          <div className="lc-panel-section">
            <div className="form-label" style={{ marginBottom: 8 }}>Pick images to add to vocab</div>
            <div className="picker-dropdowns">
              <select
                className="form-input picker-select"
                value={pickerSource?.id || ''}
                onChange={e => setPickerSource(sources.find(s => s.id === e.target.value))}
              >
                {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select
                className="form-input picker-select"
                value={pickerCategory?.id || ''}
                onChange={e => setPickerCategory(pickerCategories.find(c => c.id === e.target.value))}
              >
                {pickerCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {pickerImages.length > 0 && (
              <div className="picker-grid">
                {pickerImages.map(img => (
                  <div
                    key={img.id}
                    className={`picker-img-item ${vocab.find(v => v.image_url === img.image_url) ? 'selected' : ''}`}
                    onClick={() => handleAdd(img)}
                  >
                    <img src={img.image_url} alt={img.label} />
                    <span className="picker-img-label">{img.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lc-panel-section">
            <div className="form-label" style={{ marginBottom: 8 }}>Vocab ({vocab.length})</div>
            {vocab.length === 0 ? (
              <div className="lc-empty">No vocab yet</div>
            ) : (
              <div className="lc-cards-grid">
                {vocab.map(v => (
                  <div key={v.id} className="lc-card-thumb">
                    <div className="lc-card-thumb-img-wrap">
                      {v.image_url && <img src={v.image_url} alt={v.label} />}
                    </div>
                    <span className="lc-card-thumb-label">{v.label}</span>
                    <button
                      className="lc-card-thumb-delete btn-icon-only btn-sm danger"
                      onClick={() => handleDelete(v.id)}
                    >
                      <i className="ti ti-x" style={{ fontSize: '10px' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LCVocabPanel