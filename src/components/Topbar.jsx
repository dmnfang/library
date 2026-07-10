import { useState, useRef, useEffect } from 'react'
import './Topbar.css'

const CONTENT_TYPES = [
  { id: 'images', label: 'Images' },
  { id: 'questions', label: 'Questions' },
  { id: 'luckycard', label: 'Lucky Card' },
  { id: 'blocks', label: 'Blocks' },
  { id: 'blanks', label: 'Blanks' },
]

const ALL_GRADES = [
  { id: 'grade12', name: 'Grade 1 & 2' },
  { id: 'grade3', name: 'Grade 3' },
  { id: 'grade4', name: 'Grade 4' },
  { id: 'grade5', name: 'Grade 5' },
  { id: 'grade6', name: 'Grade 6' },
]

const LC_GRADES = [
  { id: 'grade3', name: 'Grade 3' },
  { id: 'grade4', name: 'Grade 4' },
  { id: 'grade5', name: 'Grade 5' },
  { id: 'grade6', name: 'Grade 6' },
]

const BLOCKS_GRADES = [
  { id: '5', name: 'Grade 5' },
  { id: '6', name: 'Grade 6' },
]

// Blanks' grade column is integer, so ids are numbers (not strings like Blocks)
const BLANKS_GRADES = [
  { id: 5, name: 'Grade 5' },
  { id: 6, name: 'Grade 6' },
]

function Topbar({ activeSource, onSourceChange, sources, onAddSource, contentType, onContentTypeChange }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const activeContentType = CONTENT_TYPES.find(t => t.id === contentType) || CONTENT_TYPES[0]

  const getTabs = () => {
    if (contentType === 'questions') return ALL_GRADES
    if (contentType === 'luckycard') return LC_GRADES
    if (contentType === 'blocks') return BLOCKS_GRADES
    if (contentType === 'blanks') return BLANKS_GRADES
    return null
  }

  const tabs = getTabs()

  return (
    <div className="topbar">
      <span className="topbar-title">Library</span>

      {/* Mode dropdown */}
      <div className="topbar-dropdown-wrap" ref={dropdownRef}>
        <button
          className="topbar-dropdown-trigger"
          onClick={() => setDropdownOpen(v => !v)}
        >
          <span className="topbar-dropdown-label">{activeContentType.label}</span>
          <i className={`ti ${dropdownOpen ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: '14px' }} />
        </button>

        {dropdownOpen && (
          <div className="topbar-dropdown-panel">
            {CONTENT_TYPES.map(type => (
              <div
                key={type.id}
                className={`topbar-dropdown-option ${contentType === type.id ? 'active' : ''}`}
                onClick={() => {
                  onContentTypeChange(type.id)
                  setDropdownOpen(false)
                }}
              >
                {contentType === type.id && (
                  <i className="ti ti-check" style={{ fontSize: '14px' }} />
                )}
                <span>{type.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="topbar-tabs">
        {tabs ? (
          tabs.map(grade => (
            <button
              key={grade.id}
              onClick={() => onSourceChange(grade)}
              className={`btn btn-md ${activeSource?.id === grade.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: '999px' }}
            >
              {grade.name}
            </button>
          ))
        ) : (
          sources.map(source => (
            <button
              key={source.id}
              onClick={() => onSourceChange(source)}
              className={`btn btn-md ${activeSource?.id === source.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: '999px' }}
            >
              {source.name}
            </button>
          ))
        )}
      </div>

      <div className="topbar-spacer" />

      {/* Right action button */}
      {contentType === 'images' && (
        <button className="btn btn-secondary btn-md" onClick={onAddSource}>
          <i className="ti ti-plus" style={{ fontSize: '16px' }} />
          Group
        </button>
      )}
    </div>
  )
}

export default Topbar