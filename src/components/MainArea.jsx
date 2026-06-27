import { useState, useEffect, useRef } from 'react'
import './MainArea.css'
import ImageCard from './ImageCard'
import QuestionCard from './QuestionCard'
import LCDeckArea from './LCDeckArea'

function MainArea({
  category, cards, contentType,
  onDeleteCategory, onCategoryRename, onAddCard, onEditCard,
  onBulkUpload, onDuplicateCard,
  lcModes, onLcModesChange,
  onReorderCards, onToggleCardbox,
}) {
  const [titleValue, setTitleValue] = useState('')
  const [dragging, setDragging] = useState(false)
  const [dragId, setDragId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)
  const bulkInputRef = useRef(null)

  useEffect(() => {
    setTitleValue(category?.name || '')
  }, [category?.id])

  const handleBulkDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length > 0) onBulkUpload(files)
  }

  const handleBulkInput = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'))
    if (files.length > 0) onBulkUpload(files)
    e.target.value = ''
  }

  const handleCardDragStart = (id) => {
    setDragId(id)
  }

  const handleCardDragOver = (id) => {
    if (id !== dragId) setDragOverId(id)
  }

  const handleCardDrop = (targetId) => {
    if (!dragId || dragId === targetId) return
    const from = cards.findIndex(c => c.id === dragId)
    const to = cards.findIndex(c => c.id === targetId)
    if (from === -1 || to === -1) return
    const reordered = [...cards]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    onReorderCards(reordered)
    setDragId(null)
    setDragOverId(null)
  }

  const handleCardDragEnd = () => {
    setDragId(null)
    setDragOverId(null)
  }

  const isQuestions = contentType === 'questions'
  const isLuckyCard = contentType === 'luckycard'
  const isImages = contentType === 'images'

  // Lucky Card mode
  if (isLuckyCard) {
    if (!category) {
      return (
        <div className="main-area" style={{ background: 'var(--color-bg-page)' }}>
          <div className="empty-state">
            <i className="ti ti-folder-open empty-state-icon" />
            <span className="empty-state-title">No deck selected</span>
            <span className="empty-state-sub">Choose one from the sidebar</span>
          </div>
        </div>
      )
    }
    return (
      <div className="main-area">
        <LCDeckArea
          deck={category}
          lcModes={lcModes}
          onLcModesChange={onLcModesChange}
          onRenameDeck={onCategoryRename}
          onDeleteDeck={onDeleteCategory}
        />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="main-area" style={{ background: 'var(--color-bg-page)' }}>
        <div className="empty-state">
          <i className="ti ti-folder-open empty-state-icon" />
          <span className="empty-state-title">No {isQuestions ? 'unit' : 'category'} selected</span>
          <span className="empty-state-sub">Choose one from the sidebar</span>
        </div>
      </div>
    )
  }

  const cardboxEnabled = category?.cardbox_enabled ?? false

  return (
    <div className="main-area">
      <div className="main-bar">
        <div className="main-bar-left">
          <div className="main-bar-title-wrap">
            <span className="main-bar-title-sizer">{titleValue || ' '}</span>
            <input
              className="main-bar-title-input"
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onBlur={e => onCategoryRename(category.id, e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
            />
          </div>
          <div className="main-bar-dot" />
          <span className="main-bar-count">
            {cards?.length ?? 0} {isQuestions ? 'questions' : 'cards'}
          </span>
        </div>

        <div className="main-bar-right">
          <button
            className="btn-icon-only btn-md danger"
            onClick={() => onDeleteCategory(category.id)}
            aria-label={`Delete ${isQuestions ? 'unit' : 'category'}`}
          >
            <i className="ti ti-trash" />
          </button>

          {/* Cardbox toggle — Images only */}
          {isImages && (
            <button
              className={`btn btn-md cardbox-toggle ${cardboxEnabled ? 'cardbox-toggle-on' : 'cardbox-toggle-off'}`}
              onClick={() => onToggleCardbox(category.id, !cardboxEnabled)}
              title={cardboxEnabled ? 'Visible in Cardbox — click to hide' : 'Hidden from Cardbox — click to show'}
            >
              <i className="ti ti-cards" style={{ fontSize: '14px' }} />
              Cardbox
            </button>
          )}

          {!isQuestions && (
            <button
              className="btn btn-secondary btn-md"
              onClick={() => bulkInputRef.current.click()}
            >
              <i className="ti ti-upload" style={{ fontSize: '16px' }} />
              Bulk
            </button>
          )}
          <button className="btn btn-secondary btn-md" onClick={onAddCard}>
            <i className="ti ti-plus" style={{ fontSize: '16px' }} />
            {isQuestions ? 'Question' : 'Card'}
          </button>
        </div>
      </div>

      {!isQuestions && (
        <input
          ref={bulkInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleBulkInput}
        />
      )}

      <div
        className={`main-grid-area ${dragging ? 'dragging' : ''}`}
        onDragOver={!isQuestions ? (e => { e.preventDefault(); setDragging(true) }) : undefined}
        onDragLeave={!isQuestions ? (e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false) }) : undefined}
        onDrop={!isQuestions ? handleBulkDrop : undefined}
      >
        {(cards?.length ?? 0) === 0 ? (
          <div className="main-empty">
            <i className={`ti ${isQuestions ? 'ti-help' : 'ti-photo-plus'} empty-state-icon`} />
            <span className="empty-state-title">
              No {isQuestions ? 'questions' : 'cards'} yet
            </span>
            <span className="empty-state-sub">
              {isQuestions
                ? 'Hit + Question to add your first question'
                : 'Drop images here to bulk upload, or hit + Card to add one at a time'}
            </span>
          </div>
        ) : (
          <div className={isQuestions ? 'question-grid' : 'main-grid'}>
            {isQuestions ? (
              cards.map(question => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onEdit={onEditCard}
                  onDuplicate={onDuplicateCard}
                />
              ))
            ) : (
              cards.map(card => (
                <ImageCard
                  key={card.id}
                  card={card}
                  onEdit={onEditCard}
                  onDragStart={handleCardDragStart}
                  onDragOver={handleCardDragOver}
                  onDrop={handleCardDrop}
                  onDragEnd={handleCardDragEnd}
                  isDragOver={dragOverId === card.id}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MainArea