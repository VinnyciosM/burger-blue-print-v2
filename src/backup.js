// Backup completo: lanches + biblioteca (ingredientes próprios, edições, categorias) + preferências da biblioteca.
// É um único arquivo .json que a pessoa guarda e importa em outro navegador (ou depois de limpar os dados).
import { customIngredients, libraryEdits, customCategories } from './customIngredients.js'
import { librarySettings } from './librarySettings.js'

const APP_ID = 'burger-blue-print'
const VERSION = 1

const SNACKS_KEY = 'manualburger_snacks'
const ACTIVE_KEY = 'manualburger_active_id'
const CUSTOM_KEY = 'manualburger_custom_ingredients'
const EDITS_KEY = 'manualburger_library_edits'
const CATEGORIES_KEY = 'manualburger_custom_categories'
const VIEW_KEY = 'manualburger_library_view'

const clone = (v) => JSON.parse(JSON.stringify(v))

function readSnacks() {
  try {
    const list = JSON.parse(localStorage.getItem(SNACKS_KEY) || '[]')
    if (!Array.isArray(list)) return []
    // As imagens dos ingredientes são refeitas ao abrir o app: não precisam ir no arquivo
    return list.map(s => ({
      ...s,
      ingredients: (s.ingredients || []).map(({ image, ...rest }) => rest)
    }))
  } catch {
    return []
  }
}

export function buildBackup() {
  return {
    app: APP_ID,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      snacks: readSnacks(),
      customIngredients: clone(customIngredients),
      libraryEdits: clone(libraryEdits),
      customCategories: clone(customCategories),
      librarySettings: clone(librarySettings)
    }
  }
}

export function downloadBackup() {
  const stamp = new Date().toISOString().slice(0, 10)
  const blob = new Blob([JSON.stringify(buildBackup(), null, 2) + '\n'], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `backup-burger-blue-print-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Lê e confere o arquivo (sem gravar nada). Retorna os dados limpos ou lança um erro com mensagem em português.
export async function readBackupFile(file) {
  let backup
  try {
    backup = JSON.parse(await file.text())
  } catch {
    throw new Error('Esse arquivo não é um JSON válido.')
  }
  if (!backup || backup.app !== APP_ID || typeof backup.data !== 'object' || !backup.data) {
    throw new Error('Esse arquivo não é um backup do Burger Blue Print.')
  }
  if (backup.version > VERSION) {
    throw new Error('Esse backup é de uma versão mais nova do app. Atualize o app e tente de novo.')
  }

  const d = backup.data
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v)

  const snacks = Array.isArray(d.snacks)
    ? d.snacks.filter(s => isObj(s) && Number.isFinite(s.id) && typeof s.name === 'string' && Array.isArray(s.ingredients))
    : []
  const custom = Array.isArray(d.customIngredients)
    ? d.customIngredients.filter(i => isObj(i) && typeof i.id === 'string' && typeof i.nome === 'string')
    : []
  const categories = Array.isArray(d.customCategories)
    ? d.customCategories.filter(c => isObj(c) && typeof c.id === 'string' && typeof c.nome === 'string')
    : []
  const edits = isObj(d.libraryEdits)
    ? {
        hidden: Array.isArray(d.libraryEdits.hidden) ? d.libraryEdits.hidden : [],
        overrides: isObj(d.libraryEdits.overrides) ? d.libraryEdits.overrides : {}
      }
    : { hidden: [], overrides: {} }

  return {
    snacks, custom, categories, edits,
    settings: isObj(d.librarySettings) ? d.librarySettings : null
  }
}

// Grava no navegador (substitui os dados atuais). Depois disso a página precisa ser recarregada.
export function applyBackup({ snacks, custom, categories, edits, settings }) {
  localStorage.setItem(SNACKS_KEY, JSON.stringify(snacks))
  if (snacks.length) localStorage.setItem(ACTIVE_KEY, String(snacks[0].id))
  else localStorage.removeItem(ACTIVE_KEY)
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom))
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
  localStorage.setItem(EDITS_KEY, JSON.stringify(edits))
  if (settings) localStorage.setItem(VIEW_KEY, JSON.stringify(settings))
}
