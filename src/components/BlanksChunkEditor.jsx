import { useState, useEffect } from 'react'
import { fetchSources, fetchCategories, fetchCards } from '../lib/api'
import './BlanksChunkEditor.css'

// Splits a raw English string into chunks: [text, blankable, image_url]
// Trailing . or ? always becomes its own non-blankable chunk.
function splitIntoChunks(text) {
  const trimmed = text.trim()
  if (!trimmed) return []
  const punctMatch = trimmed.match(/^(.*?)([.?])$/)
  let words, trailingPunct
  if (punctMatch) {
    words = punctMatch[1].trim().split(/\s+/).filter(Boolean)
    trailingPunct = punctMatch[2]
  } else {
    words = trimmed.split(/\s+/).filter(Boolean)
    trailingPunct = null
  }
  const chunks = words.map(w => ({ text: w, blankable: false, image_url: null }))
  if (trailingPunct) chunks.push({ text: trailingPunct, blankable: false, image_url: null })
  return chunks
}

// Inline image picker — same Source → Category → Image drill-down as Lucky Card's vocab picker
function ImagePicker({ onPick, onClose }) {
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

  return (
    <div className="bce-image-picker">
      <div className="bce-picker-header">
        <span className="bce-picker-title">Choose an image clue</span>
        <button className="btn-icon-only btn-md" onClick={onClose}><i className="ti ti-x" /></button>
      </div>
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
              className="picker-img-item"
              onClick={() => onPick(img.image_url)}
            >
              <img src={img.image_url} alt={img.label} />
              <span className="picker-img-label">{img.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BlanksChunkEditor({ onSave, onCancel, initialData }) {
  const isEditing = !!initialData

  const [pattern, setPattern] = useState(initialData?.pattern || '')
  const [sentence, setSentence] = useState(
    initialData ? initialData.chunks.map(c => c.text).join(' ') : ''
  )
  const [chunks, setChunks] = useState(initialData?.chunks || [])
  const [pickerForChunk, setPickerForChunk] = useState(null) // index of chunk showing image picker
  const [saving, setSaving] = useState(false)

  const handleSentenceCommit = () => {
    setChunks(splitIntoChunks(sentence))
    setPickerForChunk(null)
  }

  const handleToggleBlankable = (idx) => {
    setChunks(prev => prev.map((c, i) => {
      if (i !== idx) return c
      const next = !c.blankable
      return { ...c, blankable: next, image_url: next ? c.image_url : null }
    }))
    setPickerForChunk(null)
  }

  const handlePickImage = (idx, url) => {
    setChunks(prev => prev.map((c, i) => i === idx ? { ...c, image_url: url } : c))
    setPickerForChunk(null)
  }

  const handleRemoveImage = (idx) => {
    setChunks(prev => prev.map((c, i) => i === idx ? { ...c, image_url: null } : c))
  }

  const handleMerge = (gapIdx) => {
    setChunks(prev => {
      const next = [...prev]
      const a = next[gapIdx]
      const b = next[gapIdx + 1]
      const merged = {
        text: a.text + ' ' + b.text,
        blankable: a.blankable || b.blankable,
        image_url: a.image_url || b.image_url || null,
      }
      next.splice(gapIdx, 2, merged)
      return next
    })
  }

  const handleSave = async () => {
    if (chunks.length === 0) return
    setSaving(true)
    try {
      await onSave({ pattern: pattern.trim(), chunks })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bce-editor">

      <div className="bce-row-2col">
        <div className="bce-field">
          <label className="bce-label">Pattern label</label>
          <input
            className="bce-input"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder="e.g. My treasure is ..."
          />
        </div>
      </div>

      <div className="bce-field">
        <label className="bce-label">English sentence</label>
        <div className="bce-sentence-row">
          <input
            className="bce-input"
            value={sentence}
            onChange={e => setSentence(e.target.value)}
            onBlur={handleSentenceCommit}
            onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
            placeholder="Type sentence and press Enter…"
          />
          {chunks.length > 0 && (
            <button className="btn btn-ghost btn-md" onClick={handleSentenceCommit}>
              Re-split
            </button>
          )}
        </div>
      </div>

      {chunks.length > 0 && (
        <div className="bce-field">
          <label className="bce-label">Tap a word to make it a blank — tap gap to merge</label>
          <div className="bce-chunks-row">
            {chunks.map((chunk, i) => (
              <div key={i} className="bce-chunk-wrap">
                {i > 0 && (
                  <button
                    className="bce-gap"
                    onClick={() => handleMerge(i - 1)}
                    title="Merge with previous"
                  >
                    <i className="ti ti-arrows-join-2" />
                  </button>
                )}

                <div className="bce-chunk-col">
                  <button
                    className={`bce-block ${chunk.blankable ? 'blankable' : ''}`}
                    onClick={() => handleToggleBlankable(i)}
                  >
                    {chunk.blankable ? '＿＿＿' : chunk.text}
                  </button>

                  {chunk.blankable && (
                    <div className="bce-clue-row">
                      {chunk.image_url ? (
                        <div className="bce-clue-thumb">
                          <img src={chunk.image_url} alt={chunk.text} />
                          <button
                            className="bce-clue-remove"
                            onClick={() => handleRemoveImage(i)}
                            aria-label="Remove image clue"
                          >
                            <i className="ti ti-x" />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="bce-clue-add"
                          onClick={() => setPickerForChunk(pickerForChunk === i ? null : i)}
                        >
                          <i className="ti ti-photo-plus" />
                          Clue
                        </button>
                      )}
                      <span className="bce-blank-word-hint">{chunk.text}</span>
                    </div>
                  )}
                </div>

                {pickerForChunk === i && (
                  <div className="bce-picker-popover">
                    <ImagePicker
                      onPick={(url) => handlePickImage(i, url)}
                      onClose={() => setPickerForChunk(null)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bce-footer">
        <button className="btn btn-ghost btn-md" onClick={onCancel}>Cancel</button>
        <button
          className="btn btn-primary btn-md"
          onClick={handleSave}
          disabled={chunks.length === 0 || saving}
        >
          {saving ? 'Saving…' : isEditing ? 'Save' : 'Add sentence'}
        </button>
      </div>
    </div>
  )
}