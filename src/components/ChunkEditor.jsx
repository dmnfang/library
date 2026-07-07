import { useState, useEffect, useRef } from 'react'
import { ROLES, ROLE_MAP } from '../lib/roles'
import './ChunkEditor.css'

// Splits a raw English string into chunks.
// Trailing . or ? always becomes its own punct chunk.
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
  const chunks = words.map(w => [w, null])
  if (trailingPunct) chunks.push([trailingPunct, 'punct'])
  return chunks
}

// Pre-fill roles from the previous sentence in the same pattern.
// Matches by position — if chunk counts differ, only fills what lines up.
function prefillRoles(chunks, prevChunks) {
  if (!prevChunks || prevChunks.length === 0) return chunks
  return chunks.map((chunk, i) => {
    if (chunk[1]) return chunk // already assigned
    if (prevChunks[i] && prevChunks[i][1]) return [chunk[0], prevChunks[i][1]]
    return chunk
  })
}

const TIERS = ['textbook', 'test', 'advanced']

export default function ChunkEditor({ onSave, onCancel, prevChunks, initialData }) {
  const isEditing = !!initialData

  const [sentence, setSentence] = useState(initialData ? initialData.chunks.map(c => c[0]).join(' ') : '')
  const [chunks, setChunks] = useState(initialData ? initialData.chunks : [])
  const [jp, setJp] = useState(initialData?.jp || '')
  const [tier, setTier] = useState(initialData?.tier || 'textbook')
  const [activeChunk, setActiveChunk] = useState(null) // index of chunk showing role palette
  const [mergeAt, setMergeAt] = useState(null) // index of gap showing merge button (merges i and i+1)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)

  // When sentence input is committed, split into chunks and prefill roles
  const handleSentenceCommit = () => {
    const newChunks = splitIntoChunks(sentence)
    const filled = prevChunks ? prefillRoles(newChunks, prevChunks) : newChunks
    setChunks(filled)
    setActiveChunk(null)
    setMergeAt(null)
  }

  const handleAssignRole = (chunkIdx, roleKey) => {
    setChunks(prev => prev.map((c, i) => i === chunkIdx ? [c[0], roleKey] : c))
    setActiveChunk(null)
  }

  const handleMerge = (gapIdx) => {
    // Merge chunk at gapIdx and gapIdx+1 into one chunk
    setChunks(prev => {
      const next = [...prev]
      const merged = next[gapIdx][0] + ' ' + next[gapIdx + 1][0]
      const role = next[gapIdx][1] || next[gapIdx + 1][1] || null
      next.splice(gapIdx, 2, [merged, role])
      return next
    })
    setMergeAt(null)
  }

  const handleSplit = (chunkIdx) => {
    // Split a multi-word chunk back into individual words
    setChunks(prev => {
      const next = [...prev]
      const [text, role] = next[chunkIdx]
      const words = text.split(/\s+/).filter(Boolean)
      if (words.length <= 1) return prev
      const split = words.map((w, i) => [w, i === 0 ? role : null])
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
            ref={inputRef}
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
          <label className="ce-label">Assign roles — tap a block to set role, tap gap to merge</label>
          <div className="ce-chunks-row">
            {chunks.map((chunk, i) => {
              const role = chunk[1] ? ROLE_MAP[chunk[1]] : null
              const isActive = activeChunk === i
              const isMultiWord = chunk[0].includes(' ')

              return (
                <div key={i} className="ce-chunk-wrap">
                  {/* Merge gap — shown between chunks */}
                  {i > 0 && (
                    <button
                      className={`ce-gap ${mergeAt === i - 1 ? 'active' : ''}`}
                      onClick={() => setMergeAt(prev => prev === i - 1 ? null : i - 1)}
                      title="Merge with previous"
                    >
                      {mergeAt === i - 1 && (
                        <span className="ce-merge-btn" onClick={e => { e.stopPropagation(); handleMerge(i - 1) }}>
                          Merge
                        </span>
                      )}
                    </button>
                  )}

                  {/* The block itself */}
                  <div className="ce-chunk-col">
                    <button
                      className="ce-block"
                      style={{
                        background: role ? role.tint : 'var(--color-bg-surface-raised)',
                        border: `2px solid ${role ? role.dark : 'var(--color-border-strong)'}`,
                        boxShadow: role ? `0 3px 0 ${role.dark}` : '0 3px 0 var(--color-border-strong)',
                        color: '#2E2C28',
                      }}
                      onClick={() => {
                        setActiveChunk(isActive ? null : i)
                        setMergeAt(null)
                      }}
                    >
                      {chunk[0]}
                    </button>

                    {/* Split button for multi-word chunks */}
                    {isMultiWord && (
                      <button className="ce-split-btn" onClick={() => handleSplit(i)} title="Split">
                        <i className="ti ti-arrows-split-2" />
                      </button>
                    )}
                  </div>

                  {/* Role palette popover */}
                  {isActive && (
                    <div className="ce-palette">
                      {ROLES.map(r => (
                        <button
                          key={r.key}
                          className={`ce-role-chip ${chunk[1] === r.key ? 'active' : ''}`}
                          style={{
                            background: chunk[1] === r.key ? r.tint : 'var(--color-bg-surface)',
                            border: `1.5px solid ${chunk[1] === r.key ? r.dark : 'var(--color-border-default)'}`,
                            color: chunk[1] === r.key ? r.dark : 'var(--color-text-secondary)',
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
