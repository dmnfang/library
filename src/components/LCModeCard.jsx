import { useState, useEffect } from 'react'
import './LCModeCard.css'
import { fetchLCVocab, fetchLCCards, fetchLCLines } from '../lib/api'
import LCVocabPanel from './LCVocabPanel'
import LCCardsPanel from './LCCardsPanel'
import LCScriptPanel from './LCScriptPanel'

function LCModeCard({ mode, onUpdate, onDelete }) {
  const [nameValue, setNameValue] = useState(mode.name)
  const [vocab, setVocab] = useState([])
  const [cards, setCards] = useState([])
  const [lines, setLines] = useState([])
  const [panel, setPanel] = useState(null)

  useEffect(() => {
    fetchLCVocab(mode.id).then(setVocab)
    fetchLCCards(mode.id).then(setCards)
    fetchLCLines(mode.id).then(setLines)
  }, [mode.id])

  return (
    <div className="lc-mode-card">
      <div className="lc-mode-card-header">
  <div className="main-bar-title-wrap">
    <span className="main-bar-title-sizer">{nameValue || ' '}</span>
    <input
      className="main-bar-title-input"
      value={nameValue}
      onChange={e => setNameValue(e.target.value)}
      onBlur={e => onUpdate(mode.id, { name: e.target.value })}
      onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
    />
  </div>
  <button className="btn-icon-only btn-md danger" onClick={() => onDelete(mode.id)}>
    <i className="ti ti-trash" />
  </button>
</div>

      <div className="lc-mode-card-body">
        {/* Vocab section */}
        <div className="lc-mode-section">
          <div className="lc-mode-section-header">
            <span className="lc-mode-section-title">Vocab</span>
            <span className="lc-mode-section-count">{vocab.length}</span>
            <button className="btn-icon-only btn-sm" onClick={() => setPanel('vocab')}>
              <i className="ti ti-pencil" />
            </button>
          </div>
          {vocab.length === 0 ? (
            <div className="lc-mode-empty">No vocab yet</div>
          ) : (
            <div className="lc-mode-thumb-grid">
              {vocab.map(v => (
                <div key={v.id} className="lc-mode-thumb">
                  {v.image_url && <img src={v.image_url} alt={v.label} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cards section */}
        <div className="lc-mode-section">
          <div className="lc-mode-section-header">
            <span className="lc-mode-section-title">Cards</span>
            <span className="lc-mode-section-count">{cards.length}</span>
            <button className="btn-icon-only btn-sm" onClick={() => setPanel('cards')}>
              <i className="ti ti-pencil" />
            </button>
          </div>
          {cards.length === 0 ? (
            <div className="lc-mode-empty">No cards yet</div>
          ) : (
            <div className="lc-mode-thumb-grid">
              {cards.slice(0, 8).map(card => (
                <div key={card.id} className="lc-mode-thumb lc-mode-thumb--card">
                  {card.vocab_a?.image_url && (
                    <img src={card.vocab_a.image_url} alt={card.vocab_a.label} />
                  )}
                  {card.vocab_b?.image_url && (
                    <div className="lc-mode-thumb-pip">
                      <img src={card.vocab_b.image_url} alt={card.vocab_b.label} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Script section */}
        <div className="lc-mode-section">
          <div className="lc-mode-section-header">
            <span className="lc-mode-section-title">Script</span>
            <span className="lc-mode-section-count">{lines.length} lines</span>
            <button className="btn-icon-only btn-sm" onClick={() => setPanel('script')}>
              <i className="ti ti-pencil" />
            </button>
          </div>
          {lines.length === 0 ? (
            <div className="lc-mode-empty">No script yet</div>
          ) : (
            <div className="lc-mode-script-preview">
              {lines.map(line => (
  <div key={line.id} className={`lc-mode-line lc-mode-line--${line.speaker}`}>
    {line.speaker !== 'swap' && (
      <span className="lc-mode-line-speaker">{line.speaker}</span>
    )}
    <div className="lc-mode-line-bubble">
      {line.speaker === 'swap' ? '🔄 Swap cards!' : line.text}
    </div>
  </div>
))}
            </div>
          )}
        </div>
      </div>

      {panel === 'vocab' && (
        <LCVocabPanel
          mode={mode}
          initialVocab={vocab}
          onVocabChange={setVocab}
          onClose={() => setPanel(null)}
        />
      )}

      {panel === 'cards' && (
        <LCCardsPanel
          mode={mode}
          vocab={vocab}
          initialCards={cards}
          onCardsChange={setCards}
          onClose={() => setPanel(null)}
        />
      )}

      {panel === 'script' && (
        <LCScriptPanel
          mode={mode}
          initialLines={lines}
          onLinesChange={setLines}
          onClose={() => setPanel(null)}
        />
      )}
    </div>
  )
}

export default LCModeCard