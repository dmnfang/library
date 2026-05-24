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

  const confirmMessage = contentType === 'questions'
    ? `Deleting <strong>${categories.length} ${categories.length === 1 ? 'unit' : 'units'}</strong> will permanently remove <strong>${totalCards} ${totalCards === 1 ? 'question' : 'questions'}</strong>. This cannot be undone.`
    : `Deleting <strong>${categories.length} ${categories.length === 1 ? 'category' : 'categories'}</strong> will permanently remove <strong>${totalCards} ${totalCards === 1 ? 'card' : 'cards'}</strong>. This cannot be undone.`

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <div className="sidebar-title-wrap">
            <span className="sidebar-title-sizer">{titleValue || ' '}</span>
            <input
              className="sidebar-title-input"
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onBlur={e => onRenameSource(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
            />
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
          {contentType === 'questions' ? 'Unit' : 'Category'}
        </button>
      </div>

      <div className="sidebar-list">
        {categories.length === 0 ? (
          <div className="sidebar-empty">
            <i className="ti ti-folder-open" />
            No {contentType === 'questions' ? 'units' : 'categories'} yet
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
                <span className="cat-label">{cat.name}</span>
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