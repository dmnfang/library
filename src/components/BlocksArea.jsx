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
  onRequestAddSentence, onRequestEditSentence, onDeleteSentence,
}) {
  const [expanded, setExpanded] = useState(true)

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
          <button
            className="btn-icon-only btn-md ba-add-btn"
            onClick={() => onRequestAddSentence(pattern.id)}
            aria-label="Add sentence"
          >
            <i className="ti ti-plus" />
          </button>
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
          {sentences.length === 0 ? (
            <div className="ba-sentences-empty">No sentences yet — hit + to add one</div>
          ) : (
            sentences.map(s => (
              <SentenceRow
                key={s.id}
                sentence={s}
                onEdit={() => onRequestEditSentence(pattern.id, s)}
                onDelete={onDeleteSentence}
              />
            ))
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

// Sentence add/edit modal — wraps ChunkEditor in a wide modal
function SentenceModal({ initialData, prevChunks, onSave, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{initialData ? 'Edit sentence' : 'Add sentence'}</span>
          <button className="btn-icon-only btn-md" onClick={onClose}><i className="ti ti-x" /></button>
        </div>
        <div className="modal-body" style={{ paddingTop: 0 }}>
          <ChunkEditor
            initialData={initialData}
            prevChunks={prevChunks}
            onSave={onSave}
            onCancel={onClose}
          />
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
  const [sentenceModal, setSentenceModal] = useState(null) // null | { patternId, sentence: null|obj }

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

  const handleSentenceSave = async (data) => {
    const { patternId, sentence } = sentenceModal
    if (sentence) {
      await onUpdateSentence(sentence.id, data)
    } else {
      const patternSentences = sentences[patternId] || []
      await onAddSentence(patternId, data, patternSentences.length)
    }
    setSentenceModal(null)
  }

  const sentenceModalPrevChunks = sentenceModal
    ? (() => {
        const patternSentences = sentences[sentenceModal.patternId] || []
        return patternSentences.length > 0 ? patternSentences[patternSentences.length - 1].chunks : null
      })()
    : null

  return (
    <div className="main-area ba-scroll-area">
      {/* Top bar */}
      <div className="main-bar">
        <div className="main-bar-left">
          <div className="ba-unit-heading">
            <input
              key={unit.id + '-name'}
              className="ba-unit-eyebrow-input"
              defaultValue={unit.name}
              onBlur={e => onRenameUnit(unit.id, { name: e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
              placeholder="Unit 1"
            />
            <input
              key={unit.id + '-title'}
              className="ba-unit-title-input"
              defaultValue={unit.title}
              onBlur={e => onRenameUnit(unit.id, { title: e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
              placeholder="Unit title"
            />
          </div>
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
              onRequestAddSentence={(patternId) => setSentenceModal({ patternId, sentence: null })}
              onRequestEditSentence={(patternId, sentence) => setSentenceModal({ patternId, sentence })}
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

      {sentenceModal !== null && (
        <SentenceModal
          initialData={sentenceModal.sentence}
          prevChunks={sentenceModalPrevChunks}
          onSave={handleSentenceSave}
          onClose={() => setSentenceModal(null)}
        />
      )}
    </div>
  )
}