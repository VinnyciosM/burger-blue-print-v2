// Ingredientes cadastrados pelo próprio usuário.
// Ficam salvos no localStorage do navegador e aparecem junto com os da biblioteca básica.
import { reactive, computed, watch } from 'vue'
import baseData from './ingredientes.json'
import { slugify, resolveImagePath } from './ingredientImages.js'
import { reportStorageError, reportStorageOk } from './storageStatus.js'

const STORAGE_KEY = 'manualburger_custom_ingredients'
const EDITS_KEY = 'manualburger_library_edits'

export const CATEGORY_LABELS = {
  paes: 'Pães',
  carnes: 'Carnes',
  queijos: 'Queijos',
  vegetais: 'Vegetais',
  frutas: 'Frutas',
  molhos: 'Molhos',
  frios: 'Frios',
  acompanhamentos: 'Acompanhamentos',
  outros: 'Outros'
}

export const CUSTOM_PREFIX = 'custom-'

// Categorias criadas pelo usuário: [{ id, nome }]
const CATEGORIES_KEY = 'manualburger_custom_categories'

function loadCategories() {
  try {
    const saved = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]')
    if (!Array.isArray(saved)) return []
    return saved.filter(c => c && typeof c.id === 'string' && typeof c.nome === 'string')
  } catch {
    return []
  }
}

export const customCategories = reactive(loadCategories())

watch(customCategories, (list) => {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list))
  } catch (error) {
    reportStorageError(error)
  }
}, { deep: true })

export const labelFor = (id) =>
  CATEGORY_LABELS[id] || customCategories.find(c => c.id === id)?.nome || id.charAt(0).toUpperCase() + id.slice(1)

// Cria uma categoria nova. Retorna { id } ou { error }.
export function addCategory(nome) {
  const name = (nome || '').trim().replace(/\s+/g, ' ')
  if (!name) return { error: 'Digite o nome da categoria.' }
  if (name.length > 30) return { error: 'Use no máximo 30 caracteres.' }
  const id = slugify(name)
  if (!id) return { error: 'Use letras ou números no nome.' }
  const lower = name.toLowerCase()
  const exists = allCategoryIds.value.some(c => c === id || labelFor(c).toLowerCase() === lower)
  if (exists) return { error: 'Essa categoria já existe.' }
  customCategories.push({ id, nome: name })
  return { id }
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(saved)) return []
    return saved.filter(i => i && typeof i.id === 'string' && typeof i.nome === 'string')
  } catch (error) {
    console.error('Ingredientes salvos inválidos, ignorando:', error)
    return []
  }
}

export const customIngredients = reactive(load())

watch(customIngredients, (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    reportStorageOk()
  } catch (error) {
    // Normalmente é falta de espaço: as imagens são guardadas dentro do navegador
    reportStorageError(error)
  }
}, { deep: true })

// Edições feitas sobre a biblioteca básica (que vem do arquivo e não pode ser alterada no navegador):
// ingredientes apagados (hidden) e ingredientes editados (overrides, por id).
function loadEdits() {
  try {
    const saved = JSON.parse(localStorage.getItem(EDITS_KEY) || 'null')
    return {
      hidden: Array.isArray(saved?.hidden) ? saved.hidden : [],
      overrides: saved && typeof saved.overrides === 'object' && saved.overrides ? saved.overrides : {}
    }
  } catch {
    return { hidden: [], overrides: {} }
  }
}

export const libraryEdits = reactive(loadEdits())

watch(libraryEdits, (edits) => {
  try {
    localStorage.setItem(EDITS_KEY, JSON.stringify(edits))
  } catch (error) {
    reportStorageError(error)
  }
}, { deep: true })

// Lista final: biblioteca básica (com edições, sem apagados) + ingredientes cadastrados
export const libraryItems = computed(() => {
  const base = baseData
    .filter(b => !libraryEdits.hidden.includes(b.id))
    .map(b => {
      const o = libraryEdits.overrides[b.id] || {}
      return {
        id: b.id,
        slug: slugify(b.nome), // estável: os lanches salvos continuam achando a imagem
        nome: o.nome ?? b.nome,
        categoria: o.categoria ?? b.categoria,
        imagem: o.imagem || resolveImagePath(b.imagem),
        custom: false,
        edited: !!libraryEdits.overrides[b.id]
      }
    })
  const mine = customIngredients.map(c => ({ ...c, slug: c.id, custom: true, edited: false }))
  return [...base, ...mine]
})

// Todas as categorias: as dos ingredientes + as criadas pelo usuário (mesmo vazias)
export const allCategoryIds = computed(() => {
  const ids = []
  for (const i of libraryItems.value) if (!ids.includes(i.categoria)) ids.push(i.categoria)
  for (const c of customCategories) if (!ids.includes(c.id)) ids.push(c.id)
  return ids
})

let counter = 0

export function addCustomIngredient({ nome, categoria, imagem }) {
  const item = {
    id: `${CUSTOM_PREFIX}${Date.now().toString(36)}${(counter++).toString(36)}`,
    nome: nome.trim(),
    categoria: categoria || 'outros',
    imagem: imagem || ''
  }
  customIngredients.push(item)
  return item
}

export function removeCustomIngredient(id) {
  const index = customIngredients.findIndex(i => i.id === id)
  if (index !== -1) customIngredients.splice(index, 1)
}

const isCustomId = (id) => typeof id === 'string' && id.startsWith(CUSTOM_PREFIX)

// Apaga qualquer ingrediente: os cadastrados somem de vez; os da biblioteca básica ficam ocultos
export function deleteIngredient(id) {
  if (isCustomId(id)) return removeCustomIngredient(id)
  if (!libraryEdits.hidden.includes(id)) libraryEdits.hidden.push(id)
  delete libraryEdits.overrides[id]
}

// Edita nome, categoria e imagem de qualquer ingrediente
export function updateIngredient(id, { nome, categoria, imagem }) {
  if (isCustomId(id)) {
    const item = customIngredients.find(i => i.id === id)
    if (item) {
      item.nome = nome.trim()
      item.categoria = categoria || 'outros'
      item.imagem = imagem || ''
    }
    return
  }
  // Se a imagem é a mesma da biblioteca, não guarda o endereço dela: ele muda a cada atualização do site
  const base = baseData.find(b => b.id === id)
  const sameAsBase = base && imagem === resolveImagePath(base.imagem)
  libraryEdits.overrides[id] = { nome: nome.trim(), categoria: categoria || 'outros', imagem: sameAsBase ? '' : (imagem || '') }
}

// Usado ao reabrir lanches salvos: devolve a imagem de um ingrediente próprio pelo "slug" (= id)
export function customImageFor(slug) {
  return libraryItems.value.find(i => i.slug === slug)?.imagem || ''
}

// Redimensiona a imagem escolhida (lado maior = 320px) para não lotar o armazenamento do navegador
export function fileToDataUrl(file, maxSize = 320) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Escolha um arquivo de imagem (PNG, JPG, WEBP...).'))
      return
    }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.width * scale))
      canvas.height = Math.max(1, Math.round(img.height * scale))
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      // PNG mantém o fundo transparente
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler essa imagem.'))
    }
    img.src = url
  })
}

// ---------- Biblioteca em JSON (mesmo formato do ingredientes.json) ----------

// Gera o conteúdo do ingredientes.json atualizado: biblioteca básica + ingredientes do usuário.
export function buildLibraryJson(baseList = baseData) {
  const base = baseList
    .filter(b => !libraryEdits.hidden.includes(b.id))
    .map(b => {
      const o = libraryEdits.overrides[b.id]
      if (!o) return { ...b }
      return { ...b, nome: o.nome, categoria: o.categoria, imagem: o.imagem || b.imagem }
    })
  const list = [...base, ...customIngredients.map(i => ({ ...i }))]
  return JSON.stringify(list, null, 2) + '\n'
}

export function downloadLibrary(baseList = baseData) {
  const blob = new Blob([buildLibraryJson(baseList)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'ingredientes.json'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Lê um ingredientes.json e adota os ingredientes que não existem na biblioteca básica.
// Retorna quantos foram importados.
export async function importLibrary(file, baseList = baseData) {
  let data
  try {
    data = JSON.parse(await file.text())
  } catch {
    throw new Error('Esse arquivo não é um JSON válido.')
  }
  if (!Array.isArray(data)) throw new Error('O arquivo precisa conter uma lista de ingredientes.')

  const baseNames = new Set(baseList.map(i => i.nome.toLowerCase()))
  const imported = []
  for (const item of data) {
    if (!item || typeof item.nome !== 'string' || !item.nome.trim()) continue
    if (baseNames.has(item.nome.trim().toLowerCase())) continue
    const image = typeof item.imagem === 'string' && item.imagem.startsWith('data:image/') ? item.imagem : ''
    imported.push({
      id: typeof item.id === 'string' && item.id.startsWith(CUSTOM_PREFIX)
        ? item.id
        : `${CUSTOM_PREFIX}${Date.now().toString(36)}${(counter++).toString(36)}`,
      nome: item.nome.trim(),
      categoria: typeof item.categoria === 'string' && item.categoria ? item.categoria : 'outros',
      imagem: image
    })
  }

  customIngredients.splice(0, customIngredients.length, ...imported)
  return imported.length
}

// Volta para a biblioteca básica (desfaz tudo: cadastrados, editados e apagados)
export function resetLibrary() {
  customIngredients.splice(0, customIngredients.length)
  customCategories.splice(0, customCategories.length)
  libraryEdits.hidden.splice(0, libraryEdits.hidden.length)
  for (const key of Object.keys(libraryEdits.overrides)) delete libraryEdits.overrides[key]
}

export const hasLibraryChanges = computed(
  () => customIngredients.length > 0 || customCategories.length > 0 || libraryEdits.hidden.length > 0 || Object.keys(libraryEdits.overrides).length > 0
)
