import { useState, useEffect } from 'react'
import Topbar from './components/Topbar'
import Sidebar from './components/Sidebar'
import MainArea from './components/MainArea'
import CardModal from './components/CardModal'
import ConfirmModal from './components/ConfirmModal'
import QuestionModal from './components/QuestionModal'
import {
  fetchSources, addSource, renameSource, deleteSource,
  fetchCategories, addCategory, renameCategory, deleteCategory,
  fetchCards, addCard, updateCard, deleteCard, uploadImage,
  fetchUnits, addUnit, renameUnit, deleteUnit,
  fetchQuestions, addQuestion, updateQuestion, deleteQuestion, duplicateQuestion,
} from './lib/api'

function App() {
  const [sources, setSources] = useState([])
  const [activeSource, setActiveSource] = useState(null)
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [cards, setCards] = useState([])
  const [cardCounts, setCardCounts] = useState({})
  const [modalCard, setModalCard] = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [contentType, setContentType] = useState('images')
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Questions side state
  const [units, setUnits] = useState([])
  const [activeUnit, setActiveUnit] = useState(null)
  const [questions, setQuestions] = useState([])
  const [questionCounts, setQuestionCounts] = useState({})
  const [modalQuestion, setModalQuestion] = useState(undefined)

  useEffect(() => {
    fetchSources().then(data => {
      setSources(data)
      if (data.length > 0) setActiveSource(data[0])
      setLoading(false)
    }).catch(err => {
      console.error('Error fetching sources:', err)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!activeSource || contentType !== 'images') return
    setCategories([])
    setActiveCategory(null)
    setCards([])
    setCardCounts({})
    fetchCategories(activeSource.id).then(async (cats) => {
      setCategories(cats)
      const counts = {}
      await Promise.all(cats.map(async (cat) => {
        const catCards = await fetchCards(cat.id)
        counts[cat.id] = catCards.length
      }))
      setCardCounts(counts)
    })
  }, [activeSource?.id, contentType])

  useEffect(() => {
    if (!activeSource || contentType !== 'questions') return
    setUnits([])
    setActiveUnit(null)
    setQuestions([])
    setQuestionCounts({})
    fetchUnits(activeSource.id).then(async (unitList) => {
      setUnits(unitList)
      const counts = {}
      await Promise.all(unitList.map(async (unit) => {
        const unitQuestions = await fetchQuestions(unit.id)
        counts[unit.id] = unitQuestions.length
      }))
      setQuestionCounts(counts)
    })
  }, [activeSource?.id, contentType])

  useEffect(() => {
    if (!activeCategory) return
    setCards([])
    fetchCards(activeCategory.id).then(setCards)
  }, [activeCategory?.id])

  useEffect(() => {
    if (!activeUnit) return
    setQuestions([])
    fetchQuestions(activeUnit.id).then(setQuestions)
  }, [activeUnit?.id])

  const handleSourceChange = (source) => {
    setActiveSource(source)
    setActiveCategory(null)
    setActiveUnit(null)
    setCards([])
    setQuestions([])
  }

  const handleContentTypeChange = (type) => {
    setContentType(type)
    setActiveCategory(null)
    setActiveUnit(null)
    setCards([])
    setQuestions([])
    if (type === 'images') {
      setActiveSource(sources[0] || null)
    } else {
      setActiveSource({ id: 'grade3', name: 'Grade 3' })
    }
  }

  const handleAddSource = async () => {
    const newSource = await addSource('New Group', sources.length)
    setSources(prev => [...prev, newSource])
    setActiveSource(newSource)
    setActiveCategory(null)
    setCards([])
  }

  const handleRenameSource = async (newName) => {
    if (!activeSource || newName === activeSource.name) return
    await renameSource(activeSource.id, newName)
    setSources(prev => prev.map(s =>
      s.id === activeSource.id ? { ...s, name: newName } : s
    ))
    setActiveSource(prev => ({ ...prev, name: newName }))
  }

  const handleDeleteSource = async (source) => {
    await deleteSource(source.id)
    const remaining = sources.filter(s => s.id !== source.id)
    setSources(remaining)
    setActiveSource(remaining[0] || null)
    setActiveCategory(null)
    setCards([])
  }

  const handleSelectCategory = (cat) => {
    setActiveCategory(cat)
  }

  const handleAddCategory = async () => {
    const newCat = await addCategory(activeSource.id, 'New Category', categories.length)
    setCategories(prev => [...prev, newCat])
    setCardCounts(prev => ({ ...prev, [newCat.id]: 0 }))
    setActiveCategory(newCat)
    setCards([])
  }

  const handleCategoryRename = async (id, newName) => {
    await renameCategory(id, newName)
    setCategories(prev => prev.map(c =>
      c.id === id ? { ...c, name: newName } : c
    ))
    setActiveCategory(prev => prev?.id === id ? { ...prev, name: newName } : prev)
  }

  const handleDeleteCategory = async (id) => {
    await deleteCategory(id)
    setCategories(prev => prev.filter(c => c.id !== id))
    setCardCounts(prev => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
    setActiveCategory(null)
    setCards([])
  }

  const handleSelectUnit = (unit) => {
    setActiveUnit(unit)
  }

  const handleAddUnit = async () => {
    const newUnit = await addUnit(activeSource.id, 'New Unit', units.length)
    setUnits(prev => [...prev, newUnit])
    setQuestionCounts(prev => ({ ...prev, [newUnit.id]: 0 }))
    setActiveUnit(newUnit)
    setQuestions([])
  }

  const handleRenameUnit = async (id, newName) => {
    await renameUnit(id, newName)
    setUnits(prev => prev.map(u =>
      u.id === id ? { ...u, name: newName } : u
    ))
    setActiveUnit(prev => prev?.id === id ? { ...prev, name: newName } : prev)
  }

  const handleDeleteUnit = async (id) => {
    const unit = units.find(u => u.id === id)
    const count = questionCounts[id] ?? 0
    if (count > 0) {
      setConfirmDelete({
        type: 'unit',
        id,
        name: unit?.name,
        count,
        message: `Deleting this unit will permanently remove <strong>${count} ${count === 1 ? 'question' : 'questions'}</strong>. This cannot be undone.`
      })
      return
    }
    await deleteUnit(id)
    setUnits(prev => prev.filter(u => u.id !== id))
    setQuestionCounts(prev => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
    setActiveUnit(null)
    setQuestions([])
  }

  const handleSaveQuestion = async (fields) => {
    if (modalQuestion && modalQuestion.id) {
      await updateQuestion(modalQuestion.id, fields)
      setQuestions(prev => prev.map(q =>
        q.id === modalQuestion.id ? { ...q, ...fields } : q
      ))
    } else {
      const newQ = await addQuestion(activeUnit.id, fields, questions.length)
      setQuestions(prev => [...prev, newQ])
      setQuestionCounts(prev => ({
        ...prev,
        [activeUnit.id]: (prev[activeUnit.id] ?? 0) + 1
      }))
    }
    setModalQuestion(undefined)
  }

  const handleDeleteQuestion = async (id) => {
    await deleteQuestion(id)
    setQuestions(prev => prev.filter(q => q.id !== id))
    setQuestionCounts(prev => ({
      ...prev,
      [activeUnit.id]: Math.max(0, (prev[activeUnit.id] ?? 1) - 1)
    }))
    setModalQuestion(undefined)
  }

  const handleDuplicateQuestion = async (question) => {
  const originalIndex = questions.findIndex(q => q.id === question.id)
  const insertPosition = originalIndex + 1
  const newQ = await duplicateQuestion(question, insertPosition)
  setQuestions(prev => [
    ...prev.slice(0, insertPosition),
    newQ,
    ...prev.slice(insertPosition),
  ])
  setQuestionCounts(prev => ({
    ...prev,
    [activeUnit.id]: (prev[activeUnit.id] ?? 0) + 1
  }))
}

  const handleSaveCard = async ({ label, image_url }) => {
    if (modalCard) {
      await updateCard(modalCard.id, label, image_url)
      setCards(prev => prev.map(c =>
        c.id === modalCard.id ? { ...c, label, image_url } : c
      ))
    } else {
      const newCard = await addCard(activeCategory.id, label, image_url, cards.length)
      setCards(prev => [...prev, newCard])
      setCardCounts(prev => ({
        ...prev,
        [activeCategory.id]: (prev[activeCategory.id] ?? 0) + 1
      }))
    }
    setModalCard(undefined)
  }

  const handleDeleteCard = async (cardId) => {
    await deleteCard(cardId)
    setCards(prev => prev.filter(c => c.id !== cardId))
    setCardCounts(prev => ({
      ...prev,
      [activeCategory.id]: Math.max(0, (prev[activeCategory.id] ?? 1) - 1)
    }))
    setModalCard(undefined)
  }

  const handleBulkUpload = async (files) => {
    const newCards = []
    const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
    for (const file of sortedFiles) {
      const label = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
      const ext = file.name.split('.').pop()
      const path = `${activeCategory.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const imageUrl = await uploadImage(file, path)
      const newCard = await addCard(activeCategory.id, label, imageUrl, cards.length + newCards.length)
      newCards.push(newCard)
    }
    setCards(prev => [...prev, ...newCards])
    setCardCounts(prev => ({
      ...prev,
      [activeCategory.id]: (prev[activeCategory.id] ?? 0) + newCards.length
    }))
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'var(--font-display)',
        fontSize: '20px',
        color: 'var(--color-text-tertiary)',
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
    }}>
      <Topbar
        activeSource={activeSource}
        onSourceChange={handleSourceChange}
        sources={sources}
        onAddSource={handleAddSource}
        contentType={contentType}
        onContentTypeChange={handleContentTypeChange}
      />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          source={activeSource}
          categories={contentType === 'images' ? categories : units}
          activeCategory={contentType === 'images' ? activeCategory : activeUnit}
          cardCounts={contentType === 'images' ? cardCounts : questionCounts}
          contentType={contentType}
          onSelectCategory={contentType === 'images' ? handleSelectCategory : handleSelectUnit}
          onAddCategory={contentType === 'images' ? handleAddCategory : handleAddUnit}
          onRenameSource={handleRenameSource}
          onDeleteSource={handleDeleteSource}
        />
        <MainArea
  category={contentType === 'images' ? activeCategory : activeUnit}
  cards={contentType === 'images' ? cards : questions}
  contentType={contentType}
  onDeleteCategory={contentType === 'images' ? handleDeleteCategory : handleDeleteUnit}
  onCategoryRename={contentType === 'images' ? handleCategoryRename : handleRenameUnit}
  onAddCard={contentType === 'images' ? () => setModalCard(null) : () => setModalQuestion(null)}
  onEditCard={contentType === 'images' ? (card) => setModalCard(card) : (q) => setModalQuestion(q)}
  onBulkUpload={handleBulkUpload}
  onDuplicateCard={contentType === 'questions' ? handleDuplicateQuestion : null}
/>
      </div>

      {modalCard !== undefined && (
        <CardModal
          card={modalCard}
          category={activeCategory}
          onSave={handleSaveCard}
          onDelete={handleDeleteCard}
          onClose={() => setModalCard(undefined)}
        />
      )}

      {modalQuestion !== undefined && (
        <QuestionModal
          question={modalQuestion}
          onSave={handleSaveQuestion}
          onDelete={handleDeleteQuestion}
          onClose={() => setModalQuestion(undefined)}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title={`Delete "${confirmDelete.name}"?`}
          message={confirmDelete.message}
          onConfirm={async () => {
            if (confirmDelete.type === 'unit') {
              await deleteUnit(confirmDelete.id)
              setUnits(prev => prev.filter(u => u.id !== confirmDelete.id))
              setQuestionCounts(prev => {
                const updated = { ...prev }
                delete updated[confirmDelete.id]
                return updated
              })
              setActiveUnit(null)
              setQuestions([])
            }
            setConfirmDelete(null)
          }}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}

export default App