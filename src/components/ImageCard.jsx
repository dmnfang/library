import './ImageCard.css'

function ImageCard({ card, onEdit, onDragStart, onDragOver, onDrop, onDragEnd, isDragOver, isDragging }) {
  return (
    <div
      className={`image-row ${isDragOver ? 'drag-over' : ''} ${isDragging ? 'dragging' : ''}`}
      onDragOver={e => { e.preventDefault(); onDragOver?.(card.id) }}
      onDrop={e => { e.preventDefault(); onDrop?.(card.id) }}
      onDragEnd={onDragEnd}
    >
      {/* Drag handle */}
      <div
        className="image-row-handle"
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

      {/* Thumbnail */}
      <div className="image-row-thumb">
        {card.image_url
          ? <img src={card.image_url} alt={card.label} />
          : <i className="ti ti-photo" />}
      </div>

      {/* Label */}
      <span className="image-row-label">{card.label}</span>

      {/* Edit button */}
      <button
        className="image-row-edit btn-icon-only btn-md"
        onClick={() => onEdit(card)}
        aria-label="Edit card"
      >
        <i className="ti ti-edit" />
      </button>
    </div>
  )
}

export default ImageCard