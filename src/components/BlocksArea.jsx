import { useState } from 'react'
import { ROLE_MAP } from '../lib/roles'
import ChunkEditor from './ChunkEditor'
import './BlocksArea.css'

const TIER_COLORS = {
  textbook: { bg: '#EAF5EF', text: '#357E56' },
  test:     { bg: '#EAF4FB', text: '#37749E' },
  advanced: { bg: '#FCEDEE', text: '#B94553' },
}

function SentenceRow({ sentence, onEdit, onDelete }) {
  return (
    <div className="ba-sentence-row">
      <span className="ba-jp">{sentence.jp || <em>No JP prompt</em>}</span>
      <div className="ba-chunks-preview">
        {sentence.chunks.map((chunk, i) => {
          const role = chunk[1] ? ROLE_MAP[chunk[1]] : null
          return (
            <span
              key={i}
              className="ba-chunk-pill"
              style={{
                background: role ? role.tint : 'var(--color-bg-surface-raised)',
                border: `1.5px solid ${role ? role.dark : 'var(--color-border-default)'}`,
                boxShadow: role ? `0 2px 0 ${role.dark}` : '0 2px 0 var(--color-border-default)',
              }}
            >
              {chunk[0]}
            </span>
          )
        })}
      </div>
      <span
        className="ba-tier-badge"
        style={{
          background: TIER_COLORS[sentence.tier]?.bg,
          color: TIER_COLORS[sentence.tier]?.text,
        }}
      >
        {sentence.tier}
      </span>
      <div className="ba-sentence-actions">
        <button className="btn-icon-only btn-md" onClick={() => onEdit(sentence)} aria-label="Edit">
          <i className="ti ti-edit" />
        </button>
        <button className="btn-icon-only btn-md danger" onClick={() => onDelete(sentence.id)} aria-label="Delete">
          <i className="ti ti-trash" />
        </button>
      </div>
    </div>
  )
}

function PatternCard({
  pattern, sentences,
  onEditPattern, onDeletePattern,
  onAddSentence, onEditSentence, onDeleteSentence,
}) {
  const [expanded, setExpanded] = useState(true)
  const [addingHere, setAddingHere] = useState(false)
  const [editingSentence, setEditingSentence] = useState(null)

  const prevChunks = sentences.length > 0 ? sentences[sentences.length - 1].chunks : null

  const handleSaveNew = async (data) => {
    await onAddSentence(pattern.id, data, sentences.length)
    setAddingHere(false)
  }

  const handleSaveEdit = async (data) => {
    await onEditSentence(editingSentence.id, data)
    setEditingSentence(null)
  }

  return (
    <div className="ba-pattern-card">
      {/* Pattern header */}
      <div className="ba-pattern-header">
        <button className="ba-pattern-toggle" onClick={() => setExpanded(v => !v)}>
          <i className={`ti ${expanded ? 'ti-chevron-down' : 'ti-chevron-right'}`} />
        </button>
        <div className="ba-pattern-text">
          <span className="ba-pattern-frame">{pattern.frame}</span>
          {pattern.gloss && <span className="ba-pattern-gloss">{pattern.gloss}</span>}
        </div>
        <span className="ba-pattern-count">{sentences.length}</span>
        <div className="ba-pattern-actions">
          <button className="btn-icon-only btn-md" onClick={() => onEditPattern(pattern)} aria-label="Edit pattern">
            <i className="ti ti-edit" />
          </button>
          <button className="btn-icon-only btn-md danger" onClick={() => onDeletePattern(pattern.id)} aria-label="Delete pattern">
            <i className="ti ti-trash" />
          </button>
        </div>
      </div>

      {/* Sentences */}
      {expanded && (
        <div className="ba-sentences">
          {sentences.length === 0 && !addingHere && (
            <div className="ba-sentences-empty">No sentences yet</div>
          )}

          {sentences.map(s => {
            if (editingSentence?.id === s.id) {
              return (
                <div key={s.id} className="ba-sentence-editor-wrap">
                  <ChunkEditor
                    initialData={s}
                    prevChunks={prevChunks}
                    onSave={handleSaveEdit}
                    onCancel={() => setEditingSentence(null)}
                  />
                </div>
              )
            }
            return (
              <SentenceRow
                key={s.id}
                sentence={s}
                onEdit={setEditingSentence}
                onDelete={onDeleteSentence}
              />
            )
          })}

          {addingHere ? (
            <div className="ba-sentence-editor-wrap">
              <ChunkEditor
                prevChunks={prevChunks}
                onSave={handleSaveNew}
                onCancel={() => setAddingHere(false)}
              />
            </div>
          ) : (
            <button
              className="btn btn-ghost btn-md ba-add-sentence-btn"
              onClick={() => setAddingHere(true)}
            >
              <i className="ti ti-plus" style={{ fontSize: '14px' }} />
              Sentence
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Pattern edit modal
function PatternModal({ pattern, onSave, onClose }) {
  const [frame, setFrame] = useState(pattern?.frame || '')
  const [gloss, setGloss] = useState(pattern?.gloss || '')
  const [saving, setSaving] = useState(false)
  const isEditing = !!pattern

  const handleSave = async () => {
    if (!frame.trim()) return
    setSaving(true)
    try {
      await onSave({ frame: frame.trim(), gloss: gloss.trim() })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{isEditing ? 'Edit pattern' : 'Add pattern'}</span>
          <button className="btn-icon-only btn-md" onClick={onClose}><i className="ti ti-x" /></button>
        </div>
        <div className="modal-body">
          <div className="form-field">
            <label className="form-label">Frame <span className="required">*</span></label>
            <input
              className="form-input"
              value={frame}
              onChange={e => setFrame(e.target.value)}
              placeholder="e.g. My treasure is ..."
              autoFocus
            />
          </div>
          <div className="form-field">
            <label className="form-label">Gloss (Japanese)</label>
            <input
              className="form-input"
              value={gloss}
              onChange={e => setGloss(e.target.value)}
              placeholder="e.g. 私の宝物は〜です"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-md" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary btn-md"
            onClick={handleSave}
            disabled={!frame.trim() || saving}
          >
            {saving ? 'Saving…' : isEditing ? 'Save' : 'Add pattern'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BlocksArea({
  unit,
  patterns,
  sentences, // { [patternId]: sentence[] }
  onAddPattern,
  onUpdatePattern,
  onDeletePattern,
  onAddSentence,
  onUpdateSentence,
  onDeleteSentence,
  onDeleteUnit,
  onRenameUnit,
}) {
  const [patternModal, setPatternModal] = useState(null) // null | 'new' | pattern obj

  if (!unit) {
    return (
      <div className="main-area" style={{ background: 'var(--color-bg-page)' }}>
        <div className="empty-state">
          <i className="ti ti-text-size empty-state-icon" />
          <span className="empty-state-title">No unit selected</span>
          <span className="empty-state-sub">Choose one from the sidebar</span>
        </div>
      </div>
    )
  }

  const totalSentences = Object.values(sentences).reduce((acc, arr) => acc + arr.length, 0)

  const handlePatternSave = async (fields) => {
    if (patternModal === 'new') {
      await onAddPattern(unit.id, fields, patterns.length)
    } else {
      await onUpdatePattern(patternModal.id, fields)
    }
    setPatternModal(null)
  }

  return (
    <div className="main-area">
      {/* Top bar */}
      <div className="main-bar">
        <div className="main-bar-left">
          <span className="main-bar-title-input" style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600 }}>
            {unit.title || unit.name}
          </span>
          <div className="main-bar-dot" />
          <span className="main-bar-count">{patterns.length} patterns · {totalSentences} sentences</span>
        </div>
        <div className="main-bar-right">
          <button
            className="btn-icon-only btn-md danger"
            onClick={() => onDeleteUnit(unit.id)}
            aria-label="Delete unit"
          >
            <i className="ti ti-trash" />
          </button>
          <button
            className="btn btn-secondary btn-md"
            onClick={() => setPatternModal('new')}
          >
            <i className="ti ti-plus" style={{ fontSize: '16px' }} />
            Pattern
          </button>
        </div>
      </div>

      {/* Patterns */}
      <div className="ba-content">
        {patterns.length === 0 ? (
          <div className="main-empty">
            <i className="ti ti-layout-list empty-state-icon" />
            <span className="empty-state-title">No patterns yet</span>
            <span className="empty-state-sub">Hit + Pattern to add your first sentence frame</span>
          </div>
        ) : (
          patterns.map(pattern => (
            <PatternCard
              key={pattern.id}
              pattern={pattern}
              sentences={sentences[pattern.id] || []}
              onEditPattern={p => setPatternModal(p)}
              onDeletePattern={onDeletePattern}
              onAddSentence={onAddSentence}
              onEditSentence={onUpdateSentence}
              onDeleteSentence={onDeleteSentence}
            />
          ))
        )}
      </div>

      {patternModal !== null && (
        <PatternModal
          pattern={patternModal === 'new' ? null : patternModal}
          onSave={handlePatternSave}
          onClose={() => setPatternModal(null)}
        />
      )}
    </div>
  )
}