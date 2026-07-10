import { useState } from 'react'
import BlanksChunkEditor from './BlanksChunkEditor'
import './BlanksArea.css'

function SentenceRow({ sentence, onEdit, onDelete }) {
  return (
    <div className="bx-sentence-row">
      <div className="bx-chunks-preview">
        {sentence.chunks.map((chunk, i) => (
          <span
            key={i}
            className={`bx-chunk-pill ${chunk.blankable ? 'blankable' : ''}`}
          >
            {chunk.blankable && chunk.image_url && (
              <img className="bx-chunk-thumb" src={chunk.image_url} alt="" />
            )}
            {chunk.blankable ? '＿＿＿' : chunk.text}
          </span>
        ))}
      </div>
      <div className="bx-sentence-actions">
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

function PatternGroup({
  patternLabel, sentences,
  onRenamePattern, onRequestAddSentence, onRequestEditSentence, onDeleteSentence,
}) {
  const [expanded, setExpanded] = useState(true)
  const [labelValue, setLabelValue] = useState(patternLabel)

  return (
    <div className="bx-pattern-card">
      <div className="bx-pattern-header">
        <button className="bx-pattern-toggle" onClick={() => setExpanded(v => !v)}>
          <i className={`ti ${expanded ? 'ti-chevron-down' : 'ti-chevron-right'}`} />
        </button>
        <input
          key={patternLabel}
          className="bx-pattern-label-input"
          defaultValue={labelValue}
          onBlur={e => {
            const newVal = e.target.value.trim()
            if (newVal && newVal !== patternLabel) onRenamePattern(patternLabel, newVal)
          }}
          onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
          placeholder="Pattern label"
        />
        <span className="bx-pattern-count">{sentences.length}</span>
        <div className="bx-pattern-actions">
          <button
            className="btn-icon-only btn-md bx-add-btn"
            onClick={() => onRequestAddSentence(patternLabel)}
            aria-label="Add sentence to this pattern"
          >
            <i className="ti ti-plus" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="bx-sentences">
          {sentences.map(s => (
            <SentenceRow
              key={s.id}
              sentence={s}
              onEdit={() => onRequestEditSentence(s)}
              onDelete={onDeleteSentence}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Sentence add/edit modal
function SentenceModal({ initialData, defaultPattern, onSave, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{initialData ? 'Edit sentence' : 'Add sentence'}</span>
          <button className="btn-icon-only btn-md" onClick={onClose}><i className="ti ti-x" /></button>
        </div>
        <div className="modal-body" style={{ paddingTop: 0 }}>
          <BlanksChunkEditor
            initialData={initialData || (defaultPattern ? { pattern: defaultPattern, chunks: [] } : null)}
            onSave={onSave}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  )
}

export default function BlanksArea({
  unit,
  sentences, // flat array for the active unit
  onAddSentence,
  onUpdateSentence,
  onDeleteSentence,
  onBulkRenamePattern,
  onDeleteUnit,
  onRenameUnit,
}) {
  const [sentenceModal, setSentenceModal] = useState(null) // null | { mode: 'new'|'edit', pattern?, sentence? }

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

  // Group sentences by pattern text, preserving order of first appearance
  const groups = []
  const groupIndex = {}
  for (const s of sentences) {
    const label = s.pattern || 'Untitled pattern'
    if (!(label in groupIndex)) {
      groupIndex[label] = groups.length
      groups.push({ label, sentences: [] })
    }
    groups[groupIndex[label]].sentences.push(s)
  }

  const handleSentenceSave = async (data) => {
    if (sentenceModal.mode === 'edit') {
      await onUpdateSentence(sentenceModal.sentence.id, data)
    } else {
      await onAddSentence(data, sentences.length)
    }
    setSentenceModal(null)
  }

  return (
    <div className="main-area bx-scroll-area">
      <div className="main-bar">
        <div className="main-bar-left">
          <div className="bx-unit-heading">
            <div className="bx-unit-eyebrow-row">
              <span className="bx-unit-eyebrow-prefix">Unit</span>
              <input
                key={unit.id + '-num'}
                type="number"
                min="1"
                className="bx-unit-eyebrow-input"
                defaultValue={unit.unit_number}
                onBlur={e => onRenameUnit(unit.id, { unit_number: parseInt(e.target.value, 10) || 1 })}
                onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
              />
            </div>
            <input
              key={unit.id + '-title'}
              className="bx-unit-title-input"
              defaultValue={unit.title}
              onBlur={e => onRenameUnit(unit.id, { title: e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
              placeholder="Unit title"
            />
          </div>
        </div>
        <div className="main-bar-right">
          <span className="bx-meta-count">{groups.length} patterns · {sentences.length} sentences</span>
          <button
            className="btn-icon-only btn-md danger"
            onClick={() => onDeleteUnit(unit.id)}
            aria-label="Delete unit"
          >
            <i className="ti ti-trash" />
          </button>
          <button
            className="btn btn-secondary btn-md"
            onClick={() => setSentenceModal({ mode: 'new' })}
          >
            <i className="ti ti-plus" style={{ fontSize: '16px' }} />
            Sentence
          </button>
        </div>
      </div>

      <div className="bx-content">
        {groups.length === 0 ? (
          <div className="main-empty">
            <i className="ti ti-text-size empty-state-icon" />
            <span className="empty-state-title">No sentences yet</span>
            <span className="empty-state-sub">Hit + Sentence to add your first one</span>
          </div>
        ) : (
          groups.map(group => (
            <PatternGroup
              key={group.label}
              patternLabel={group.label}
              sentences={group.sentences}
              onRenamePattern={onBulkRenamePattern}
              onRequestAddSentence={(patternLabel) => setSentenceModal({ mode: 'new', pattern: patternLabel })}
              onRequestEditSentence={(sentence) => setSentenceModal({ mode: 'edit', sentence })}
              onDeleteSentence={onDeleteSentence}
            />
          ))
        )}
      </div>

      {sentenceModal !== null && (
        <SentenceModal
          initialData={sentenceModal.mode === 'edit' ? sentenceModal.sentence : null}
          defaultPattern={sentenceModal.pattern}
          onSave={handleSentenceSave}
          onClose={() => setSentenceModal(null)}
        />
      )}
    </div>
  )
}