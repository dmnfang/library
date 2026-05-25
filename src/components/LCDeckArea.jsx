import { useState } from 'react'
import './LCDeckArea.css'
import { addLCMode, updateLCMode, deleteLCMode } from '../lib/api'
import LCModeCard from './LCModeCard'

function LCDeckArea({ deck, lcModes, onLcModesChange, onRenameDeck, onDeleteDeck }) {
  const [titleValue, setTitleValue] = useState(deck?.name || '')

  const handleAddMode = async () => {
    const newMode = await addLCMode(deck.id, 'New Mode', lcModes.length)
    onLcModesChange(prev => [...prev, newMode])
  }

  const handleUpdateMode = async (id, fields) => {
    await updateLCMode(id, fields)
    onLcModesChange(prev => prev.map(m => m.id === id ? { ...m, ...fields } : m))
  }

  const handleDeleteMode = async (id) => {
    await deleteLCMode(id)
    onLcModesChange(prev => prev.filter(m => m.id !== id))
  }

  if (!deck) return null

  return (
    <div className="lc-deck-area">
      <div className="main-bar">
        <div className="main-bar-left">
          <div className="main-bar-title-wrap">
            <span className="main-bar-title-sizer">{titleValue || ' '}</span>
            <input
              className="main-bar-title-input"
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onBlur={e => onRenameDeck(deck.id, e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
            />
          </div>
          <div className="main-bar-dot" />
          <span className="main-bar-count">{lcModes.length} modes</span>
        </div>
        <div className="main-bar-right">
          <button className="btn btn-secondary btn-md" onClick={handleAddMode}>
            <i className="ti ti-plus" style={{ fontSize: '16px' }} />
            Mode
          </button>
          <button
            className="btn-icon-only btn-md danger"
            onClick={() => onDeleteDeck(deck.id)}
          >
            <i className="ti ti-trash" />
          </button>
        </div>
      </div>

      <div className="lc-deck-body">
        {lcModes.length === 0 ? (
          <div className="lc-empty-modes">
            <i className="ti ti-cards empty-state-icon" />
            <span className="empty-state-title">No modes yet</span>
            <span className="empty-state-sub">Hit + Mode to add your first mode</span>
          </div>
        ) : (
          <div className="lc-modes-grid">
            {lcModes.map(mode => (
              <LCModeCard
                key={mode.id}
                mode={mode}
                onUpdate={handleUpdateMode}
                onDelete={handleDeleteMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LCDeckArea