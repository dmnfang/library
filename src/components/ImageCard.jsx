import './ImageCard.css'

function ImageCard({ card, onEdit, onDragStart, onDragOver, onDrop, onDragEnd, isDragOver }) {
  return (
    <div
      className={`image-card ${isDragOver ? 'drag-over' : ''}`}
      onClick={() => onEdit(card)}
      onDragOver={e => { e.preventDefault(); onDragOver?.(card.id) }}
      onDrop={e => { e.preventDefault(); onDrop?.(card.id) }}
      onDragEnd={onDragEnd}
    >
      {/* Drag handle */}
      <div
        className="image-card-drag-handle"
        draggable
        onDragStart={e => {
          e.stopPropagation()
          onDragStart?.(card.id)
        }}
        onClick={e => e.stopPropagation()}
        aria-label="Drag to reorder"
      >
        <i className="ti ti-grip-vertical" />
      </div>

      <div className="image-card-img-area">
        {card.image_url ? (
          <img src={card.image_url} alt={card.label} />
        ) : (
          <div className="image-card-placeholder">
            <i className="ti ti-photo" />
          </div>
        )}
        <button
          className="image-card-edit-btn btn-icon-only btn-md"
          onClick={e => { e.stopPropagation(); onEdit(card) }}
          aria-label="Edit card"
        >
          <i className="ti ti-edit" />
        </button>
      </div>
      <div className="image-card-label">{card.label}</div>
    </div>
  )
}

export default ImageCard