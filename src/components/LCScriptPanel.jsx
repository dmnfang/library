import { useState } from 'react'
import './LCScriptPanel.css'
import { addLCLine, deleteLCLine, updateLCLine } from '../lib/api'

const SPEAKERS = ['A', 'B', 'swap']

function LCScriptPanel({ mode, initialLines, onLinesChange, onClose }) {
  const [lines, setLines] = useState(initialLines || [])
  const [addingSpeaker, setAddingSpeaker] = useState('A')
  const [addingText, setAddingText] = useState('')
  const [editingLine, setEditingLine] = useState(null)

  const updateLines = (newLines) => {
    setLines(newLines)
    onLinesChange(newLines)
  }

  const handleLineClick = (line) => {
    if (editingLine?.id === line.id) {
      setEditingLine(null)
      setAddingSpeaker('A')
      setAddingText('')
      return
    }
    setEditingLine(line)
    setAddingSpeaker(line.speaker)
    setAddingText(line.speaker === 'swap' ? '' : line.text)
  }

  const handleAddOrSave = async () => {
    if (editingLine) {
      const text = addingSpeaker === 'swap' ? 'Swap cards!' : addingText.trim()
      if (addingSpeaker !== 'swap' && !text) return
      await updateLCLine(editingLine.id, { speaker: addingSpeaker, text })
      updateLines(lines.map(l =>
        l.id === editingLine.id ? { ...l, speaker: addingSpeaker, text } : l
      ))
      setEditingLine(null)
      setAddingSpeaker('A')
      setAddingText('')
    } else {
      if (addingSpeaker !== 'swap' && !addingText.trim()) return
      const text = addingSpeaker === 'swap' ? 'Swap cards!' : addingText.trim()
      const newLine = await addLCLine(mode.id, addingSpeaker, text, lines.length)
      updateLines([...lines, newLine])
      setAddingText('')
    }
  }

  const handleDeleteLine = async (id) => {
    await deleteLCLine(id)
    updateLines(lines.filter(l => l.id !== id))
    if (editingLine?.id === id) {
      setEditingLine(null)
      setAddingSpeaker('A')
      setAddingText('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddOrSave()
  }

  const handleCancel = () => {
    setEditingLine(null)
    setAddingSpeaker('A')
    setAddingText('')
  }

  return (
    <div className="lc-panel-overlay" onClick={onClose}>
      <div className="lc-panel" onClick={e => e.stopPropagation()}>
        <div className="lc-panel-header">
          <span className="lc-panel-title">{mode.name} — Script</span>
          <button className="btn-icon-only btn-md" onClick={onClose}>
            <i className="ti ti-x" />
          </button>
        </div>

        <div className="lc-panel-body">
          <div className="lc-script-composer">
            <div className="lc-script-composer-toolbar">
              <div className="lc-speaker-toggle">
                {SPEAKERS.map(s => (
                  <button
                    key={s}
                    className={`lc-speaker-btn ${addingSpeaker === s ? 'active' : ''}`}
                    onClick={() => setAddingSpeaker(s)}
                  >
                    {s === 'swap' ? '🔄' : s}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {editingLine && (
                  <button className="btn btn-ghost btn-md" onClick={handleCancel}>
                    Cancel
                  </button>
                )}
                <button
                  className="btn btn-primary btn-md"
                  onClick={handleAddOrSave}
                  disabled={addingSpeaker !== 'swap' && !addingText.trim()}
                >
                  {editingLine ? 'Save' : 'Add'}
                </button>
              </div>
            </div>
            {addingSpeaker !== 'swap' ? (
              <textarea
                className="lc-script-textarea"
                placeholder="Type a line... (Cmd+Enter to add)"
                value={addingText}
                onChange={e => setAddingText(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                rows={3}
              />
            ) : (
              <div className="lc-swap-preview">🔄 Swap cards!</div>
            )}
            {editingLine && (
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                Editing line — click Save or Cancel
              </div>
            )}
          </div>

          <div className="lc-script-lines">
            {lines.length === 0 ? (
              <div className="lc-empty">No lines yet</div>
            ) : lines.map(line => (
              <div
                key={line.id}
                className={`lc-script-line lc-script-line--${line.speaker} ${editingLine?.id === line.id ? 'editing' : ''}`}
                onClick={() => handleLineClick(line)}
                style={{ cursor: 'pointer' }}
              >
                {line.speaker !== 'swap' && (
                  <span className="lc-script-speaker">{line.speaker}</span>
                )}
                <div className="lc-script-line-bubble">
                  <span className="lc-script-text">
                    {line.speaker === 'swap' ? '🔄 Swap cards!' : line.text}
                  </span>
                  <button
                    className="btn-icon-only btn-sm"
                    onClick={e => { e.stopPropagation(); handleDeleteLine(line.id) }}
                  >
                    <i className="ti ti-x" style={{ fontSize: '12px' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LCScriptPanel