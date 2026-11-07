// Tema do app: modo (claro / escuro / sistema) e cor principal.
// Tudo é salvo no localStorage do navegador de quem usa.
import { reactive, watch } from 'vue'

const STORAGE_KEY = 'manualburger_theme'

export const DEFAULT_ACCENT = '#f38b41'

export const ACCENTS = [
  { name: 'Laranja', value: '#f38b41' },
  { name: 'Vermelho', value: '#e5484d' },
  { name: 'Amarelo', value: '#f5c542' },
  { name: 'Verde', value: '#3fb27f' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' }
]

export const MODES = [
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Escuro' },
  { id: 'system', label: 'Sistema' }
]

export const theme = reactive({ mode: 'dark', accent: DEFAULT_ACCENT })

const isHex = (v) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

// Escurece (amount < 0) ou clareia (amount > 0) a cor
function shade([r, g, b], amount) {
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + amount * (amount < 0 ? c : 255 - c))))
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`
}

// Cor do texto sobre a cor principal (preto ou branco, conforme o brilho)
function onAccent([r, g, b]) {
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.6 ? '#1a1109' : '#ffffff'
}

const media = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : null

function resolvedMode() {
  if (theme.mode === 'system') return media && !media.matches ? 'light' : 'dark'
  return theme.mode
}

export function applyTheme() {
  const root = document.documentElement
  const rgb = hexToRgb(theme.accent)
  root.dataset.theme = resolvedMode()
  root.style.setProperty('--accent', theme.accent)
  root.style.setProperty('--accent-hover', shade(rgb, -0.12))
  root.style.setProperty('--accent-soft', `rgba(${rgb.join(', ')}, 0.14)`)
  root.style.setProperty('--accent-border', `rgba(${rgb.join(', ')}, 0.4)`)
  root.style.setProperty('--on-accent', onAccent(rgb))
}

export function resetTheme() {
  theme.mode = 'dark'
  theme.accent = DEFAULT_ACCENT
}

export function initTheme() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (saved && MODES.some(m => m.id === saved.mode)) theme.mode = saved.mode
    if (saved && isHex(saved.accent)) theme.accent = saved.accent
  } catch (error) {
    console.error('Tema salvo inválido, usando o padrão:', error)
  }

  applyTheme()

  watch(theme, () => {
    if (!isHex(theme.accent)) theme.accent = DEFAULT_ACCENT
    applyTheme()
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode: theme.mode, accent: theme.accent }))
    } catch (error) {
      console.error('Não foi possível salvar o tema:', error)
    }
  }, { deep: true })

  // No modo "Sistema", acompanha a mudança do sistema operacional
  media?.addEventListener?.('change', () => { if (theme.mode === 'system') applyTheme() })
}
