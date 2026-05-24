import './ImageCard.css'

function ImageCard({ card, onEdit }) {
  return (
    <div className="image-card" onClick={() => onEdit(card)}>
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