import { toPng } from 'html-to-image'

// Qualidade de saída: 300 DPI (a folha é desenhada a 96 DPI na tela)
const PIXEL_RATIO = 300 / 96

const pad = (n) => String(n).padStart(2, '0')

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function mmToPx(value, fallback) {
  const mm = parseFloat(value)
  return Number.isFinite(mm) && /mm$/.test(value) ? Math.round(mm * 96 / 25.4) : fallback
}

function download(dataUrl, filename) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// Salva as folhas escolhidas como PNG, uma por arquivo.
// `sheets`: elementos .paper-sheet; `indexes`: posições (0, 1, 2...) a salvar.
export async function exportSheetsAsPng(sheets, indexes, onProgress = () => {}) {
  let done = 0
  for (const index of indexes) {
    const el = sheets[index]
    if (!el) continue
    const dataUrl = await toPng(el, {
      pixelRatio: PIXEL_RATIO,
      backgroundColor: '#ffffff',
      cacheBust: true,
      // Tira o zoom da pré-visualização e a sombra: o PNG sai com o tamanho real da folha
      style: { zoom: '1', margin: '0', boxShadow: 'none' },
      // Tamanho real da folha (vem em mm no estilo), sem depender do zoom da tela
      width: mmToPx(el.style.width, el.offsetWidth),
      height: mmToPx(el.style.height, el.offsetHeight)
    })
    download(dataUrl, `Manual-Burger-folha-${pad(index + 1)}.png`)
    onProgress(++done, indexes.length)
    await wait(350) // o navegador precisa de um respiro entre downloads seguidos
  }
}
