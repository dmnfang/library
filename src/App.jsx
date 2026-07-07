import { useState, useEffect } from 'react'
import Topbar from './components/Topbar'
import Sidebar from './components/Sidebar'
import MainArea from './components/MainArea'
import BlocksArea from './components/BlocksArea'
import CardModal from './components/CardModal'
import ConfirmModal from './components/ConfirmModal'
import QuestionModal from './components/QuestionModal'
import {
  fetchSources, addSource, renameSource, deleteSource,
  fetchCategories, addCategory, renameCategory, deleteCategory,
  fetchCards, addCard, updateCard, deleteCard, uploadImage,
  fetchUnits, addUnit, renameUnit, deleteUnit,
  fetchQuestions, addQuestion, updateQuestion, deleteQuestion, duplicateQuestion,
  fetchLCDecks, addLCDeck, renameLCDeck, deleteLCDeck,
  fetchLCModes, addLCMode, updateLCMode, deleteLCMode,
  fetchLCVocab, addLCVocab, deleteLCVocab,
  fetchLCCards, addLCCard, updateLCCard, deleteLCCard,
  fetchLCLines, addLCLine, deleteLCLine,
  updateCardPositions,
  setCategoryCardboxEnabled,
  fetchBlocksUnits, addBlocksUnit, renameBlocksUnit, deleteBlocksUnit,
  fetchBlocksPatterns, addBlocksPattern, updateBlocksPattern, deleteBlocksPattern,
  fetchBlocksSentences, addBlocksSentence, updateBlocksSentence, deleteBlocksSentence,
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

  const [units, setUnits] = useState([])
  const [activeUnit, setActiveUnit] = useState(null)
  const [questions, setQuestions] = useState([])
  const [questionCounts, setQuestionCounts] = useState({})
  const [modalQuestion, setModalQuestion] = useState(undefined)

  const [lcDecks, setLcDecks] = useState([])
  const [activeLcDeck, setActiveLcDeck] = useState(null)
  const [lcModes, setLcModes] = useState([])
  const [lcModeCounts, setLcModeCounts] = useState({})
  const [lcFetchKey, setLcFetchKey] = useState(0)

  // ── Blocks state ──
  const [blocksUnits, setBlocksUnits] = useState([])
  const [activeBlocksUnit, setActiveBlocksUnit] = useState(null)
  const [blocksPatterns, setBlocksPatterns] = useState([]) // pattern[]
  const [blocksSentences, setBlocksSentences] = useState({}) // { [patternId]: sentence[] }
  const [blocksUnitCounts, setBlocksUnitCounts] = useState({}) // { [unitId]: patternCount }

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
    if (contentType !== 'luckycard' || !activeSource) return
    setLcDecks([])
    setActiveLcDeck(null)
    setLcModes([])
    setLcModeCounts({})
    fetchLCDecks(activeSource.id).then(async decks => {
      setLcDecks(decks)
      const counts = {}
      await Promise.all(decks.map(async deck => {
        const modes = await fetchLCModes(deck.id)
        counts[deck.id] = modes.length
      }))
      setLcModeCounts(counts)
    })
  }, [lcFetchKey, activeSource?.id])

  useEffect(() => {
    if (!activeLcDeck) return
    setLcModes([])
    fetchLCModes(activeLcDeck.id).then(setLcModes)
  }, [activeLcDeck?.id])

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

  // Fetch blocks units when grade changes
  useEffect(() => {
    if (contentType !== 'blocks' || !activeSource) return
    setBlocksUnits([])
    setActiveBlocksUnit(null)
    setBlocksPatterns([])
    setBlocksSentences({})
    setBlocksUnitCounts({})
    fetchBlocksUnits(activeSource.id).then(async (unitList) => {
      setBlocksUnits(unitList)
      const counts = {}
      await Promise.all(unitList.map(async (u) => {
        const patterns = await fetchBlocksPatterns(u.id)
        counts[u.id] = patterns.length
      }))
      setBlocksUnitCounts(counts)
    })
  }, [activeSource?.id, contentType])

  // Fetch patterns + sentences when blocks unit changes
  useEffect(() => {
    if (!activeBlocksUnit) return
    setBlocksPatterns([])
    setBlocksSentences({})
    fetchBlocksPatterns(activeBlocksUnit.id).then(async (patterns) => {
      setBlocksPatterns(patterns)
      const sentMap = {}
      await Promise.all(patterns.map(async (p) => {
        const sents = await fetchBlocksSentences(p.id)
        sentMap[p.id] = sents
      }))
      setBlocksSentences(sentMap)
    })
  }, [activeBlocksUnit?.id])

  const handleSourceChange = (source) => {
    setActiveSource(source)
    setActiveCategory(null)
    setActiveUnit(null)
    setActiveLcDeck(null)
    setActiveBlocksUnit(null)
    setCards([])
    setQuestions([])
    setLcModes([])
    setBlocksPatterns([])
    setBlocksSentences({})
    if (contentType === 'luckycard') setLcFetchKey(k => k + 1)
  }

  const handleContentTypeChange = (type) => {
    setContentType(type)
    setActiveCategory(null)
    setActiveUnit(null)
    setActiveLcDeck(null)
    setActiveBlocksUnit(null)
    setCards([])
    setQuestions([])
    setLcModes([])
    setBlocksPatterns([])
    setBlocksSentences({})
    if (type === 'images') {
      setActiveSource(sources[0] || null)
    } else if (type === 'questions') {
      setActiveSource({ id: 'grade3', name: 'Grade 3' })
    } else if (type === 'luckycard') {
      setActiveSource({ id: 'grade3', name: 'Grade 3' })
      setLcFetchKey(k => k + 1)
    } else if (type === 'blocks') {
      setActiveSource({ id: '5', name: 'Grade 5' })
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

  const handleSelectCategory = (cat) => setActiveCategory(cat)

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

  const handleSelectUnit = (unit) => setActiveUnit(unit)

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

  const handleSelectLcDeck = (deck) => {
    setActiveLcDeck(deck)
    setLcModes([])
  }

  const handleAddLcDeck = async () => {
    const newDeck = await addLCDeck(activeSource.id, 'New Deck', lcDecks.length)
    setLcDecks(prev => [...prev, newDeck])
    setLcModeCounts(prev => ({ ...prev, [newDeck.id]: 0 }))
    setActiveLcDeck(newDeck)
    setLcModes([])
  }

  const handleRenameLcDeck = async (id, newName) => {
    await renameLCDeck(id, newName)
    setLcDecks(prev => prev.map(d =>
      d.id === id ? { ...d, name: newName } : d
    ))
    setActiveLcDeck(prev => prev?.id === id ? { ...prev, name: newName } : prev)
  }

  const handleDeleteLcDeck = async (id) => {
    await deleteLCDeck(id)
    setLcDecks(prev => prev.filter(d => d.id !== id))
    setLcModeCounts(prev => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
    setActiveLcDeck(null)
    setLcModes([])
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

  const handleReorderCards = async (reordered) => {
    setCards(reordered)
    try {
      await updateCardPositions(reordered)
    } catch (err) {
      console.error('Failed to save card order:', err)
      fetchCards(activeCategory.id).then(setCards)
    }
  }

  const handleToggleCardbox = async (id, enabled) => {
    try {
      await setCategoryCardboxEnabled(id, enabled)
      setCategories(prev => prev.map(c =>
        c.id === id ? { ...c, cardbox_enabled: enabled } : c
      ))
      setActiveCategory(prev =>
        prev?.id === id ? { ...prev, cardbox_enabled: enabled } : prev
      )
    } catch (err) {
      console.error('Failed to update cardbox visibility:', err)
    }
  }

  // ── Blocks handlers ──

  const handleSelectBlocksUnit = (unit) => {
    setActiveBlocksUnit(unit)
    setBlocksPatterns([])
    setBlocksSentences({})
  }

  const handleAddBlocksUnit = async () => {
    const sort_order = blocksUnits.length
    const newUnit = await addBlocksUnit(activeSource.id, 'Unit ' + (blocksUnits.length + 1), 'New Unit', sort_order)
    setBlocksUnits(prev => [...prev, newUnit])
    setBlocksUnitCounts(prev => ({ ...prev, [newUnit.id]: 0 }))
    setActiveBlocksUnit(newUnit)
    setBlocksPatterns([])
    setBlocksSentences({})
  }

  const handleDeleteBlocksUnit = async (id) => {
    await deleteBlocksUnit(id)
    setBlocksUnits(prev => prev.filter(u => u.id !== id))
    setBlocksUnitCounts(prev => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
    setActiveBlocksUnit(null)
    setBlocksPatterns([])
    setBlocksSentences({})
  }

  const handleRenameBlocksUnit = async (id, newTitle) => {
    await renameBlocksUnit(id, newTitle, newTitle)
    setBlocksUnits(prev => prev.map(u =>
      u.id === id ? { ...u, title: newTitle } : u
    ))
    setActiveBlocksUnit(prev =>
      prev?.id === id ? { ...prev, title: newTitle } : prev
    )
  }

  const handleAddBlocksPattern = async (unitId, fields, sort_order) => {
    const newPattern = await addBlocksPattern(unitId, fields.frame, fields.gloss, sort_order)
    setBlocksPatterns(prev => [...prev, newPattern])
    setBlocksSentences(prev => ({ ...prev, [newPattern.id]: [] }))
    setBlocksUnitCounts(prev => ({ ...prev, [unitId]: (prev[unitId] ?? 0) + 1 }))
  }

  const handleUpdateBlocksPattern = async (id, fields) => {
    await updateBlocksPattern(id, fields)
    setBlocksPatterns(prev => prev.map(p => p.id === id ? { ...p, ...fields } : p))
  }

  const handleDeleteBlocksPattern = async (id) => {
    await deleteBlocksPattern(id)
    setBlocksPatterns(prev => prev.filter(p => p.id !== id))
    setBlocksSentences(prev => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
    if (activeBlocksUnit) {
      setBlocksUnitCounts(prev => ({
        ...prev,
        [activeBlocksUnit.id]: Math.max(0, (prev[activeBlocksUnit.id] ?? 1) - 1)
      }))
    }
  }

  const handleAddBlocksSentence = async (patternId, { chunks, jp, tier }, sort_order) => {
    const newSentence = await addBlocksSentence(patternId, jp, tier, chunks, sort_order)
    setBlocksSentences(prev => ({
      ...prev,
      [patternId]: [...(prev[patternId] || []), newSentence]
    }))
  }

  const handleUpdateBlocksSentence = async (id, { chunks, jp, tier }) => {
    await updateBlocksSentence(id, { chunks, jp, tier })
    setBlocksSentences(prev => {
      const updated = { ...prev }
      for (const pid of Object.keys(updated)) {
        updated[pid] = updated[pid].map(s => s.id === id ? { ...s, chunks, jp, tier } : s)
      }
      return updated
    })
  }

  const handleDeleteBlocksSentence = async (id) => {
    await deleteBlocksSentence(id)
    setBlocksSentences(prev => {
      const updated = { ...prev }
      for (const pid of Object.keys(updated)) {
        updated[pid] = updated[pid].filter(s => s.id !== id)
      }
      return updated
    })
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

  const isBlocks = contentType === 'blocks'

  const sidebarCategories =
    contentType === 'images' ? categories :
    contentType === 'questions' ? units :
    contentType === 'luckycard' ? lcDecks :
    blocksUnits

  const sidebarActiveCategory =
    contentType === 'images' ? activeCategory :
    contentType === 'questions' ? activeUnit :
    contentType === 'luckycard' ? activeLcDeck :
    activeBlocksUnit

  const sidebarCardCounts =
    contentType === 'images' ? cardCounts :
    contentType === 'questions' ? questionCounts :
    contentType === 'luckycard' ? lcModeCounts :
    blocksUnitCounts

  const sidebarOnSelect =
    contentType === 'images' ? handleSelectCategory :
    contentType === 'questions' ? handleSelectUnit :
    contentType === 'luckycard' ? handleSelectLcDeck :
    handleSelectBlocksUnit

  const sidebarOnAdd =
    contentType === 'images' ? handleAddCategory :
    contentType === 'questions' ? handleAddUnit :
    contentType === 'luckycard' ? handleAddLcDeck :
    handleAddBlocksUnit

  const mainCategory =
    contentType === 'images' ? activeCategory :
    contentType === 'questions' ? activeUnit :
    contentType === 'luckycard' ? activeLcDeck :
    null // blocks uses BlocksArea directly

  const mainCards =
    contentType === 'images' ? cards :
    contentType === 'questions' ? questions :
    []

  const mainOnDeleteCategory =
    contentType === 'images' ? handleDeleteCategory :
    contentType === 'questions' ? handleDeleteUnit :
    contentType === 'luckycard' ? handleDeleteLcDeck :
    null

  const mainOnCategoryRename =
    contentType === 'images' ? handleCategoryRename :
    contentType === 'questions' ? handleRenameUnit :
    contentType === 'luckycard' ? handleRenameLcDeck :
    null

  const mainOnAddCard =
    contentType === 'images' ? () => setModalCard(null) :
    contentType === 'questions' ? () => setModalQuestion(null) :
    null

  const mainOnEditCard =
    contentType === 'images' ? (card) => setModalCard(card) :
    contentType === 'questions' ? (q) => setModalQuestion(q) :
    null

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
          categories={sidebarCategories}
          activeCategory={sidebarActiveCategory}
          cardCounts={sidebarCardCounts}
          contentType={contentType}
          onSelectCategory={sidebarOnSelect}
          onAddCategory={sidebarOnAdd}
          onRenameSource={handleRenameSource}
          onDeleteSource={handleDeleteSource}
        />

        {isBlocks ? (
          <BlocksArea
            unit={activeBlocksUnit}
            patterns={blocksPatterns}
            sentences={blocksSentences}
            onAddPattern={handleAddBlocksPattern}
            onUpdatePattern={handleUpdateBlocksPattern}
            onDeletePattern={handleDeleteBlocksPattern}
            onAddSentence={handleAddBlocksSentence}
            onUpdateSentence={handleUpdateBlocksSentence}
            onDeleteSentence={handleDeleteBlocksSentence}
            onDeleteUnit={handleDeleteBlocksUnit}
            onRenameUnit={handleRenameBlocksUnit}
          />
        ) : (
          <MainArea
            category={mainCategory}
            cards={mainCards}
            contentType={contentType}
            onDeleteCategory={mainOnDeleteCategory}
            onCategoryRename={mainOnCategoryRename}
            onAddCard={mainOnAddCard}
            onEditCard={mainOnEditCard}
            onBulkUpload={handleBulkUpload}
            onDuplicateCard={contentType === 'questions' ? handleDuplicateQuestion : null}
            lcModes={lcModes}
            onLcModesChange={setLcModes}
            onReorderCards={handleReorderCards}
            onToggleCardbox={handleToggleCardbox}
          />
        )}
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