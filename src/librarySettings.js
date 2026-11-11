import { reactive, watch } from 'vue'

const KEY = 'manualburger_library_view'

export const VIEW_STYLES = [
  { id: 'grid', label: 'Grade', hint: 'Cartões com imagem grande' },
  { id: 'list', label: 'Lista', hint: 'Uma linha por ingrediente, com imagem' },
  { id: 'compact', label: 'Lista compacta', hint: 'Linhas menores, cabe mais na tela' }
]

const defaults = () => ({
  order: [],          // ids de categoria na ordem escolhida (as que faltam vão para o fim)
  view: 'grid',
  collapsible: false, // permite recolher/expandir cada categoria
  showCount: true     // mostra a quantidade de ingredientes ao lado da categoria
})

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (saved && typeof saved === 'object') {
      const base = defaults()
      return {
        order: Array.isArray(saved.order) ? saved.order.filter(x => typeof x === 'string') : base.order,
        view: VIEW_STYLES.some(v => v.id === saved.view) ? saved.view : base.view,
        collapsible: typeof saved.collapsible === 'boolean' ? saved.collapsible : base.collapsible,
        showCount: typeof saved.showCount === 'boolean' ? saved.showCount : base.showCount
      }
    }
  } catch { /* usa o padrão */ }
  return defaults()
}

export const librarySettings = reactive(load())

watch(librarySettings, (v) => {
  try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* sem espaço: ignora */ }
}, { deep: true })

// Ordena uma lista de ids de categoria conforme a ordem salva
export function sortCategoryIds(ids) {
  const rank = (id) => {
    const i = librarySettings.order.indexOf(id)
    return i === -1 ? Infinity : i
  }
  return ids.map((id, pos) => ({ id, pos })).sort((a, b) => (rank(a.id) - rank(b.id)) || (a.pos - b.pos)).map(x => x.id)
}

export function resetCategoryOrder() {
  librarySettings.order = []
}
