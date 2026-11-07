import { reactive } from 'vue'

// Tamanho padrão de cada manual (página) na área de trabalho, em px do "mundo"
export const PAGE_W = 320
export const PAGE_H = 560
export const GAP = 48

// Câmera da área de trabalho (fica aqui para sobreviver à troca entre "Montar" e "Gerar manual")
export const view = reactive({ x: 0, y: 0, z: 1, ready: false })

const hasPos = (s) => Number.isFinite(s.x) && Number.isFinite(s.y)

const overlaps = (a, b) =>
  a.x < b.x + b.w + GAP / 2 && a.x + a.w + GAP / 2 > b.x &&
  a.y < b.y + b.h + GAP / 2 && a.y + a.h + GAP / 2 > b.y

// Dá posição/tamanho a um manual que ainda não tem: primeiro espaço livre numa grade (4 por linha)
export function placeSnack(snack, snacks) {
  snack.hidden = !!snack.hidden
  snack.locked = !!snack.locked
  // Tamanho fixo: todos os manuais têm o mesmo tamanho (manuais antigos redimensionados são normalizados)
  snack.w = PAGE_W
  snack.h = PAGE_H
  if (hasPos(snack)) return

  const others = snacks.filter(s => s !== snack && hasPos(s))
  const rect = { w: PAGE_W, h: PAGE_H }
  for (let slot = 0; ; slot++) {
    rect.x = (slot % 4) * (PAGE_W + GAP)
    rect.y = Math.floor(slot / 4) * (PAGE_H + GAP + 40)
    if (!others.some(o => overlaps(rect, o))) break
  }
  Object.assign(snack, rect)
}

export function placeAll(snacks) {
  for (const snack of snacks) placeSnack(snack, snacks)
}
