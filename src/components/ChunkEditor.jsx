import { useState, useEffect } from 'react'
import { ROLES, ROLE_MAP } from '../lib/roles'
import { fetchSources, fetchCategories, fetchCards } from '../lib/api'
import './ChunkEditor.css'

// Chunk shape: [text, role, blankable, image_url]
// Trailing . or ? always becomes its own punct chunk, never blankable.
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
  const chunks = words.map(w => [w, null, false, null])
  if (trailingPunct) chunks.push([trailingPunct, 'punct', false, null])
  return chunks
}

// Pre-fill roles from the previous sentence in the same pattern (position-matched).
function prefillRoles(chunks, prevChunks) {
  if (!prevChunks || prevChunks.length === 0) return chunks
  return chunks.map((chunk, i) => {
    if (chunk[1]) return chunk
    if (prevChunks[i] && prevChunks[i][1]) return [chunk[0], prevChunks[i][1], chunk[2], chunk[3]]
    return chunk
  })
}

// Image picker as a centered overlay — never clipped by the parent modal
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
    <div className="ce-picker-overlay" onClick={onClose}>
      <div className="ce-picker-card" onClick={e => e.stopPropagation()}>
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
              <div key={img.id} className="picker-img-item" onClick={() => onPick(img.image_url)}>
                <img src={img.image_url} alt={img.label} />
                <span className="picker-img-label">{img.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const TIERS = ['textbook', 'test', 'advanced']

export default function ChunkEditor({ onSave, onCancel, prevChunks, initialData }) {
  const isEditing = !!initialData

  const [sentence, setSentence] = useState(initialData ? initialData.chunks.map(c => c[0]).join(' ') : '')
  const [chunks, setChunks] = useState(initialData ? initialData.chunks : [])
  const [jp, setJp] = useState(initialData?.jp || '')
  const [tier, setTier] = useState(initialData?.tier || 'textbook')
  const [activeChunk, setActiveChunk] = useState(null) // index showing role palette
  const [pickerForChunk, setPickerForChunk] = useState(null) // index showing image picker
  const [saving, setSaving] = useState(false)

  const handleSentenceCommit = () => {
    const newChunks = splitIntoChunks(sentence)
    const filled = prevChunks ? prefillRoles(newChunks, prevChunks) : newChunks
    setChunks(filled)
    setActiveChunk(null)
  }

  const handleAssignRole = (chunkIdx, roleKey) => {
    setChunks(prev => prev.map((c, i) => i === chunkIdx ? [c[0], roleKey, c[2], c[3]] : c))
    setActiveChunk(null)
  }

  const handleToggleBlankable = (chunkIdx) => {
    setChunks(prev => prev.map((c, i) => {
      if (i !== chunkIdx) return c
      const next = !c[2]
      return [c[0], c[1], next, next ? c[3] : null]
    }))
    setPickerForChunk(null)
  }

  const handlePickImage = (chunkIdx, url) => {
    setChunks(prev => prev.map((c, i) => i === chunkIdx ? [c[0], c[1], c[2], url] : c))
    setPickerForChunk(null)
  }

  const handleRemoveImage = (chunkIdx) => {
    setChunks(prev => prev.map((c, i) => i === chunkIdx ? [c[0], c[1], c[2], null] : c))
  }

  const handleMerge = (gapIdx) => {
    setChunks(prev => {
      const next = [...prev]
      const a = next[gapIdx]
      const b = next[gapIdx + 1]
      const merged = [
        a[0] + ' ' + b[0],
        a[1] || b[1] || null,
        a[2] || b[2],
        a[3] || b[3] || null,
      ]
      next.splice(gapIdx, 2, merged)
      return next
    })
  }

  const handleSplit = (chunkIdx) => {
    setChunks(prev => {
      const next = [...prev]
      const [text, role, blankable, image_url] = next[chunkIdx]
      const words = text.split(/\s+/).filter(Boolean)
      if (words.length <= 1) return prev
      const split = words.map((w, i) =>
        i === 0 ? [w, role, blankable, image_url] : [w, null, false, null]
      )
      next.splice(chunkIdx, 1, ...split)
      return next
    })
    setActiveChunk(null)
  }

  const handleSave = async () => {
    if (chunks.length === 0 || chunks.some(c => !c[1])) return
    setSaving(true)
    try {
      await onSave({ chunks, jp, tier })
    } finally {
      setSaving(false)
    }
  }

  const allRolesAssigned = chunks.length > 0 && chunks.every(c => c[1])

  return (
    <div className="chunk-editor">

      {/* Sentence input */}
      <div className="ce-field">
        <label className="ce-label">English sentence</label>
        <div className="ce-sentence-row">
          <input
            className="ce-input"
            value={sentence}
            onChange={e => setSentence(e.target.value)}
            onBlur={handleSentenceCommit}
            onKeyDown={e => { if (e.key === 'Enter') { e.target.blur() } }}
            placeholder="Type sentence and press Enter…"
          />
          {chunks.length > 0 && (
            <button className="btn btn-ghost btn-md" onClick={handleSentenceCommit}>
              Re-split
            </button>
          )}
        </div>
      </div>

      {/* Chunk builder */}
      {chunks.length > 0 && (
        <div className="ce-field">
          <label className="ce-label">Tap a block for role — tap ✦ to blank it — tap gap to merge</label>
          <div className="ce-chunks-row">
            {chunks.map((chunk, i) => {
              const [text, roleKey, blankable, image_url] = chunk
              const role = roleKey ? ROLE_MAP[roleKey] : null
              const isActive = activeChunk === i
              const isMultiWord = text.includes(' ')

              return (
                <div key={i} className="ce-chunk-wrap">
                  {i > 0 && (
                    <button
                      className="ce-gap"
                      onClick={() => handleMerge(i - 1)}
                      title="Merge with previous"
                    >
                      <i className="ti ti-arrows-join-2" />
                    </button>
                  )}

                  <div className="ce-chunk-col">
                    <button
                      className="ce-block"
                      style={{
                        background: role ? role.tint : 'var(--color-bg-surface-raised)',
                        border: blankable
                          ? '2px dashed #4A5FC1'
                          : `2px solid ${role ? role.dark : 'var(--color-border-strong)'}`,
                        boxShadow: `0 3px 0 ${blankable ? '#37479A' : (role ? role.dark : 'var(--color-border-strong)')}`,
                        color: blankable ? '#37479A' : '#2E2C28',
                      }}
                      onClick={() => setActiveChunk(isActive ? null : i)}
                    >
                      {blankable ? '＿＿＿' : text}
                    </button>

                    <div className="ce-chunk-toolbar">
                      {isMultiWord && (
                        <button className="ce-split-btn" onClick={() => handleSplit(i)} title="Split">
                          <i className="ti ti-arrows-split-2" />
                        </button>
                      )}
                      {roleKey !== 'punct' && (
                        <button
                          className={`ce-blank-toggle ${blankable ? 'active' : ''}`}
                          onClick={() => handleToggleBlankable(i)}
                          title={blankable ? 'Remove blank' : 'Make this a blank'}
                        >
                          <i className="ti ti-square-dashed" />
                        </button>
                      )}
                    </div>

                    {blankable && (
                      <div className="ce-clue-row">
                        {image_url ? (
                          <div className="ce-clue-thumb" onClick={() => setPickerForChunk(i)}>
                            <img src={image_url} alt={text} />
                            <button
                              className="ce-clue-remove"
                              onClick={e => { e.stopPropagation(); handleRemoveImage(i) }}
                              aria-label="Remove image clue"
                            >
                              <i className="ti ti-x" />
                            </button>
                          </div>
                        ) : (
                          <button className="ce-clue-add" onClick={() => setPickerForChunk(i)}>
                            <i className="ti ti-photo-plus" />
                            Clue
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {isActive && (
                    <div className="ce-palette">
                      {ROLES.map(r => (
                        <button
                          key={r.key}
                          className={`ce-role-chip ${roleKey === r.key ? 'active' : ''}`}
                          style={{
                            background: roleKey === r.key ? r.tint : 'var(--color-bg-surface)',
                            border: `1.5px solid ${roleKey === r.key ? r.dark : 'var(--color-border-default)'}`,
                            color: roleKey === r.key ? r.dark : 'var(--color-text-secondary)',
                          }}
                          onClick={() => handleAssignRole(i, r.key)}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* JP prompt + tier */}
      <div className="ce-row-2col">
        <div className="ce-field">
          <label className="ce-label">Japanese prompt</label>
          <input
            className="ce-input"
            value={jp}
            onChange={e => setJp(e.target.value)}
            placeholder="e.g. 私の宝物は〜です"
          />
        </div>
        <div className="ce-field">
          <label className="ce-label">Tier</label>
          <div className="ce-tier-row">
            {TIERS.map(t => (
              <button
                key={t}
                className={`btn btn-md ${tier === t ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTier(t)}
                style={{ borderRadius: '999px', textTransform: 'capitalize' }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {pickerForChunk !== null && (
        <ImagePicker
          onPick={(url) => handlePickImage(pickerForChunk, url)}
          onClose={() => setPickerForChunk(null)}
        />
      )}

      {/* Footer */}
      <div className="ce-footer">
        {!allRolesAssigned && chunks.length > 0 && (
          <span className="ce-warning">
            <i className="ti ti-alert-circle" /> Assign all roles before saving
          </span>
        )}
        <button className="btn btn-ghost btn-md" onClick={onCancel}>Cancel</button>
        <button
          className="btn btn-primary btn-md"
          onClick={handleSave}
          disabled={!allRolesAssigned || saving}
        >
          {saving ? 'Saving…' : isEditing ? 'Save' : 'Add sentence'}
        </button>
      </div>
    </div>
  )
}