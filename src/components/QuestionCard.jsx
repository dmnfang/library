import './QuestionCard.css'

const TYPE_CONFIG = {
  Q: { label: 'Question', color: 'sage' },
  S: { label: 'Skit', color: 'coral' },
}

function formatText(text) {
  if (!text) return null
  return text.split('\n').map((line, i, arr) => (
    <span key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </span>
  ))
}

function QuestionCard({ question, onEdit, onDuplicate }) {
  const typeConfig = TYPE_CONFIG[question.type] || TYPE_CONFIG.Q

  const helperImages = (() => {
    if (!question.helper_images) return []
    try {
      return JSON.parse(question.helper_images).filter(img => img !== null)
    } catch {
      return []
    }
  })()

  return (
    <div className="question-card">
      <div className="question-card-header">
        <div className="question-card-chips">
          <span className={`question-chip question-chip--${typeConfig.color}`}>
            {typeConfig.label}
          </span>
          <span className="question-chip question-chip--neutral">
            {question.pair === 'TS' ? 'T + S' : 'S + S'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className="btn-icon-only btn-md"
            onClick={() => onDuplicate(question)}
            aria-label="Duplicate question"
          >
            <i className="ti ti-copy" />
          </button>
          <button
            className="btn-icon-only btn-md"
            onClick={() => onEdit(question)}
            aria-label="Edit question"
          >
            <i className="ti ti-edit" />
          </button>
        </div>
      </div>

      <div className="question-card-body">
        {question.type === 'S' ? (
          <div className="question-skit">
            <div className="question-line">
              <span className="question-line-label q">Q</span>
              <span className="question-line-text">{formatText(question.question)}</span>
            </div>
            <div className="question-line">
              <span className="question-line-label a">A</span>
              <span className="question-line-text question-scaffold">{formatText(question.scaffold)}</span>
            </div>
            {question.question2 && (
              <div className="question-line">
                <span className="question-line-label q">Q</span>
                <span className="question-line-text">{formatText(question.question2)}</span>
              </div>
            )}
            {question.scaffold2 && (
              <div className="question-line">
                <span className="question-line-label a">A</span>
                <span className="question-line-text question-scaffold">{formatText(question.scaffold2)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="question-qa">
            <div className="question-line">
              <span className="question-line-label q">Q</span>
              <span className="question-line-text">{formatText(question.question)}</span>
            </div>
            <div className="question-line">
              <span className="question-line-label a">A</span>
              <span className={`question-line-text ${question.answer ? 'question-scaffold question-scaffold--tappable' : 'question-scaffold'}`}>
                {formatText(question.scaffold)}
              </span>
            </div>
          </div>
        )}
      </div>

      {helperImages.length > 0 && (
        <div className="question-card-images">
          {helperImages.map((img, i) => (
            <img
              key={i}
              src={img.image_url}
              alt={img.label || ''}
              className="question-card-img-thumb"
            />
          ))}
        </div>
      )}

    </div>
  )
}

export default QuestionCard