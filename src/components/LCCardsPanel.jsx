import { useState } from 'react'
import './LCCardsPanel.css'
import { addLCCard, deleteLCCard } from '../lib/api'

function LCCardsPanel({ mode, vocab, initialCards, onCardsChange, onClose }) {
  const [cards, setCards] = useState(initialCards || [])
  const [selectedA, setSelectedA] = useState(null)
  const [selectedB, setSelectedB] = useState(null)

  const updateCards = (newCards) => {
    setCards(newCards)
    onCardsChange(newCards)
  }

  const handleVocabClick = (v) => {
    if (selectedA?.id === v.id) {
      setSelectedA(null)
      return
    }
    if (selectedB?.id === v.id) {
      setSelectedB(null)
      return
    }
    if (!selectedA) {
      setSelectedA(v)
      return
    }
    if (!selectedB) {
      setSelectedB(v)
      return
    }
  }

  const handleAddCard = async () => {
    if (!selectedA) return
    const newCard = await addLCCard(mode.id, selectedA.id, selectedB?.id || null, cards.length)
    updateCards([...cards, newCard])
    setSelectedA(null)
    setSelectedB(null)
  }

  const handleDeleteCard = async (id) => {
    await deleteLCCard(id)
    updateCards(cards.filter(c => c.id !== id))
  }

  const getTag = (v) => {
    if (selectedA?.id === v.id) return 'Main'
    if (selectedB?.id === v.id) return 'Badge'
    return null
  }

  return (
    <div className="lc-panel-overlay" onClick={onClose}>
      <div className="lc-panel" onClick={e => e.stopPropagation()}>
        <div className="lc-panel-header">
          <span className="lc-panel-title">{mode.name} — Cards</span>
          <button className="btn-icon-only btn-md" onClick={onClose}>
            <i className="ti ti-x" />
          </button>
        </div>
        <div className="lc-panel-body">

          {/* Vocab picker */}
          <div className="lc-panel-section">
            <div className="form-label" style={{ marginBottom: 8 }}>
              Select vocab to build a card — first pick is Main, second is Badge (PiP)
            </div>
            <div className="lc-cards-grid">
              {vocab.map(v => {
                const tag = getTag(v)
                return (
                  <div
                    key={v.id}
                    className={`lc-card-thumb lc-card-picker-item ${tag ? 'active' : ''} ${tag === 'Main' ? 'tag-main' : ''} ${tag === 'Badge' ? 'tag-badge' : ''}`}
                    onClick={() => handleVocabClick(v)}
                  >
                    <div className="lc-card-thumb-img-wrap">
                      {v.image_url && <img src={v.image_url} alt={v.label} />}
                    </div>
                    <span className="lc-card-thumb-label">{v.label}</span>
                    {tag && (
                      <div className={`lc-vocab-tag lc-vocab-tag--${tag.toLowerCase()}`}>
                        {tag}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              className="btn btn-primary btn-md"
              style={{ marginTop: 12, alignSelf: 'flex-start' }}
              disabled={!selectedA}
              onClick={handleAddCard}
            >
              <i className="ti ti-plus" style={{ fontSize: '16px' }} />
              Add Card{selectedB ? ` (PiP)` : ''}
            </button>
          </div>

          {/* Cards list */}
          <div className="lc-panel-section">
            <div className="form-label" style={{ marginBottom: 8 }}>Cards ({cards.length})</div>
            {cards.length === 0 ? (
              <div className="lc-empty">No cards yet</div>
            ) : (
              <div className="lc-cards-grid">
                {cards.map(card => (
                  <div key={card.id} className="lc-card-thumb">
                    <div className="lc-card-thumb-img-wrap">
                      {card.vocab_a?.image_url && (
                        <img src={card.vocab_a.image_url} alt={card.vocab_a.label} />
                      )}
                      {card.vocab_b?.image_url && (
                        <div className="lc-card-thumb-badge">
                          <img src={card.vocab_b.image_url} alt={card.vocab_b.label} />
                        </div>
                      )}
                    </div>
                    <span className="lc-card-thumb-label">
                      {card.vocab_a?.label}{card.vocab_b ? ` + ${card.vocab_b.label}` : ''}
                    </span>
                    <button
                      className="lc-card-thumb-delete btn-icon-only btn-sm danger"
                      onClick={() => handleDeleteCard(card.id)}
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

export default LCCardsPanel