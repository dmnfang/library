import { supabase } from '../supabase'

// ── SOURCES ──

export async function fetchSources() {
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .order('position')
  if (error) throw error
  return data
}

export async function addSource(name, position) {
  const { data, error } = await supabase
    .from('sources')
    .insert({ name, position })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function renameSource(id, name) {
  const { error } = await supabase
    .from('sources')
    .update({ name })
    .eq('id', id)
  if (error) throw error
}

export async function deleteSource(id) {
  const { error } = await supabase
    .from('sources')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── CATEGORIES ──

export async function fetchCategories(sourceId) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('source_id', sourceId)
    .order('position')
  if (error) throw error
  return data
}

export async function addCategory(sourceId, name, position) {
  const { data, error } = await supabase
    .from('categories')
    .insert({ source_id: sourceId, name, position })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function renameCategory(id, name) {
  const { error } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', id)
  if (error) throw error
}

export async function deleteCategory(id) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── CARDS ──

export async function fetchCards(categoryId) {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('category_id', categoryId)
    .order('position')
  if (error) throw error
  return data
}

export async function addCard(categoryId, label, imageUrl, position) {
  const { data, error } = await supabase
    .from('cards')
    .insert({ category_id: categoryId, label, image_url: imageUrl, position })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCard(id, label, imageUrl) {
  const { error } = await supabase
    .from('cards')
    .update({ label, image_url: imageUrl })
    .eq('id', id)
  if (error) throw error
}

export async function deleteCard(id) {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── STORAGE ──

export async function uploadImage(file, path) {
  const { data, error } = await supabase.storage
    .from('hiroba-images')
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data: urlData } = supabase.storage
    .from('hiroba-images')
    .getPublicUrl(path)
  return urlData.publicUrl
}

// ── GRADES ──

export async function fetchGrades() {
  const { data, error } = await supabase
    .from('grades')
    .select('*')
    .order('position')
  if (error) throw error
  return data
}

// ── UNITS ──

export async function fetchUnits(gradeId) {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('grade_id', gradeId)
    .order('position')
  if (error) throw error
  return data
}

export async function addUnit(gradeId, name, position) {
  const { data, error } = await supabase
    .from('units')
    .insert({ grade_id: gradeId, name, position })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function renameUnit(id, name) {
  const { error } = await supabase
    .from('units')
    .update({ name })
    .eq('id', id)
  if (error) throw error
}

export async function deleteUnit(id) {
  const { error } = await supabase
    .from('units')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── QUESTIONS ──

export async function fetchQuestions(unitId) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('unit_id', unitId)
    .order('position')
  if (error) throw error
  return data
}

export async function addQuestion(unitId, fields, position) {
  const { data, error } = await supabase
    .from('questions')
    .insert({ unit_id: unitId, ...fields, position })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateQuestion(id, fields) {
  const { error } = await supabase
    .from('questions')
    .update(fields)
    .eq('id', id)
  if (error) throw error
}

export async function deleteQuestion(id) {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function duplicateQuestion(question, position) {
  const { data, error } = await supabase
    .from('questions')
    .insert({
      unit_id: question.unit_id,
      type: question.type,
      pair: question.pair,
      question: question.question,
      scaffold: question.scaffold,
      answer: question.answer,
      question2: question.question2,
      scaffold2: question.scaffold2,
      image_url: question.image_url,
      helper_images: question.helper_images,
      position,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── LUCKY CARD DECKS ──

export async function fetchLCDecks(gradeId) {
  const { data, error } = await supabase
    .from('lc_decks')
    .select('*')
    .eq('grade_id', gradeId)
    .order('position')
  if (error) throw error
  return data
}

export async function addLCDeck(gradeId, name, position) {
  const { data, error } = await supabase
    .from('lc_decks')
    .insert({ grade_id: gradeId, name, position })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function renameLCDeck(id, name) {
  const { error } = await supabase
    .from('lc_decks')
    .update({ name })
    .eq('id', id)
  if (error) throw error
}

export async function deleteLCDeck(id) {
  const { error } = await supabase
    .from('lc_decks')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── LUCKY CARD MODES ──

export async function fetchLCModes(deckId) {
  const { data, error } = await supabase
    .from('lc_modes')
    .select('*')
    .eq('deck_id', deckId)
    .order('position')
  if (error) throw error
  return data
}

export async function addLCMode(deckId, name, position) {
  const { data, error } = await supabase
    .from('lc_modes')
    .insert({ deck_id: deckId, name, position })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateLCMode(id, fields) {
  const { error } = await supabase
    .from('lc_modes')
    .update(fields)
    .eq('id', id)
  if (error) throw error
}

export async function deleteLCMode(id) {
  const { error } = await supabase
    .from('lc_modes')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── LUCKY CARD VOCAB ──

export async function fetchLCVocab(modeId) {
  const { data, error } = await supabase
    .from('lc_vocab')
    .select('*')
    .eq('mode_id', modeId)
    .order('position')
  if (error) throw error
  return data
}

export async function addLCVocab(modeId, label, image_url, position) {
  const { data, error } = await supabase
    .from('lc_vocab')
    .insert({ mode_id: modeId, label, image_url, position })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLCVocab(id) {
  const { error } = await supabase
    .from('lc_vocab')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── LUCKY CARD CARDS ──

export async function fetchLCCards(modeId) {
  const { data, error } = await supabase
    .from('lc_cards')
    .select('*, vocab_a:vocab_a_id(*), vocab_b:vocab_b_id(*)')
    .eq('mode_id', modeId)
    .order('position')
  if (error) throw error
  return data
}

export async function addLCCard(modeId, vocab_a_id, vocab_b_id, position) {
  const { data, error } = await supabase
    .from('lc_cards')
    .insert({ mode_id: modeId, vocab_a_id, vocab_b_id, position })
    .select('*, vocab_a:vocab_a_id(*), vocab_b:vocab_b_id(*)')
    .single()
  if (error) throw error
  return data
}

export async function updateLCCard(id, fields) {
  const { error } = await supabase
    .from('lc_cards')
    .update(fields)
    .eq('id', id)
  if (error) throw error
}

export async function deleteLCCard(id) {
  const { error } = await supabase
    .from('lc_cards')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── LUCKY CARD LINES ──

export async function fetchLCLines(modeId) {
  const { data, error } = await supabase
    .from('lc_lines')
    .select('*')
    .eq('mode_id', modeId)
    .order('position')
  if (error) throw error
  return data
}

export async function addLCLine(modeId, speaker, text, position) {
  const { data, error } = await supabase
    .from('lc_lines')
    .insert({ mode_id: modeId, speaker, text, position })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLCLine(id) {
  const { error } = await supabase
    .from('lc_lines')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function updateLCLine(id, fields) {
  const { error } = await supabase
    .from('lc_lines')
    .update(fields)
    .eq('id', id)
  if (error) throw error
}