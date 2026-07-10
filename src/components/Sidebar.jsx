import { useState, useEffect } from 'react'
import './Sidebar.css'
import ConfirmModal from './ConfirmModal'

function Sidebar({ source, categories, activeCategory, cardCounts, contentType, onSelectCategory, onAddCategory, onRenameSource, onDeleteSource }) {
  const [titleValue, setTitleValue] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    setTitleValue(source?.name || '')
  }, [source?.id])

  const handleDeleteSource = () => {
    if (categories.length > 0) {
      setConfirmDelete(true)
    } else {
      onDeleteSource(source)
    }
  }

  const totalCards = categories.reduce((acc, cat) => acc + (cardCounts[cat.id] ?? 0), 0)

  const itemLabel =
    contentType === 'questions' ? 'unit' :
    contentType === 'luckycard' ? 'deck' :
    contentType === 'blocks' ? 'unit' :
    contentType === 'blanks' ? 'unit' :
    'category'

  const itemLabelPlural =
    contentType === 'questions' ? 'units' :
    contentType === 'luckycard' ? 'decks' :
    contentType === 'blocks' ? 'units' :
    contentType === 'blanks' ? 'units' :
    'categories'

  const childLabel =
    contentType === 'questions' ? 'question' :
    contentType === 'blocks' ? 'pattern' :
    contentType === 'blanks' ? 'sentence' :
    'card'

  const childLabelPlural =
    contentType === 'questions' ? 'questions' :
    contentType === 'blocks' ? 'patterns' :
    contentType === 'blanks' ? 'sentences' :
    'cards'

  const confirmMessage = `Deleting <strong>${categories.length} ${categories.length === 1 ? itemLabel : itemLabelPlural}</strong> will permanently remove <strong>${totalCards} ${totalCards === 1 ? childLabel : childLabelPlural}</strong>. This cannot be undone.`

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <div className="sidebar-title-wrap">
            {contentType === 'images' ? (
              <>
                <span className="sidebar-title-sizer">{titleValue || ' '}</span>
                <input
                  className="sidebar-title-input"
                  value={titleValue}
                  onChange={e => setTitleValue(e.target.value)}
                  onBlur={e => onRenameSource(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
                />
              </>
            ) : (
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 600,
                lineHeight: '32px',
                color: 'var(--color-text-title)',
              }}>
                {source?.name || ''}
              </span>
            )}
          </div>
          {contentType === 'images' && (
            <button
              className="btn-icon-only btn-md danger"
              onClick={handleDeleteSource}
              aria-label="Delete source"
            >
              <i className="ti ti-trash" />
            </button>
          )}
        </div>

        <button
          className="btn btn-primary btn-md"
          onClick={onAddCategory}
          style={{ width: '100%' }}
        >
          <i className="ti ti-plus" style={{ fontSize: '16px' }} />
          {itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1)}
        </button>
      </div>

      <div className="sidebar-list">
        {categories.length === 0 ? (
          <div className="sidebar-empty">
            <i className="ti ti-folder-open" />
            No {itemLabelPlural} yet
          </div>
        ) : (
          categories.map(cat => {
            const isActive = activeCategory?.id === cat.id
            return (
              <div
                key={cat.id}
                className={`cat-row ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat)}
              >
                <div className="cat-dot" />
                <span className="cat-label">
                  {contentType === 'blocks'
                    ? <>{cat.name} <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 400 }}>— {cat.title}</span></>
                    : contentType === 'blanks'
                    ? <>Unit {cat.unit_number} <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 400 }}>— {cat.title}</span></>
                    : cat.name}
                </span>
                <div className="cat-count">{cardCounts[cat.id] ?? 0}</div>
              </div>
            )
          })
        )}
      </div>

      {confirmDelete && (
        <ConfirmModal
          title={`Delete "${source?.name}"?`}
          message={confirmMessage}
          onConfirm={() => {
            onDeleteSource(source)
            setConfirmDelete(false)
          }}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}

export default Sidebar