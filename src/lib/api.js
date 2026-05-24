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