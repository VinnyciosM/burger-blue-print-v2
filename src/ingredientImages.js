// Resolve a imagem de um ingrediente a partir da pasta src/assets/ingredientes.
// Convenção: o arquivo tem o nome do ingrediente em "slug" (ver README da pasta).
// Ex.: "Alface e tomate" -> alface-e-tomate.png

const files = import.meta.glob('./assets/ingredientes/*.{png,jpg,jpeg,webp,avif,svg,gif}', {
  eager: true,
  query: '?url',
  import: 'default'
})

const bySlug = {}
for (const [path, url] of Object.entries(files)) {
  const slug = path.split('/').pop().replace(/\.[^.]+$/, '').toLowerCase()
  bySlug[slug] = url
}

export function slugify(name = '') {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Retorna a URL da imagem a partir do slug ou '' se o arquivo não existe.
export function resolveImage(slug) {
  return bySlug[slug] || ''
}

// Retorna a URL a partir do caminho declarado no JSON (ex.: "assets/ingredientes/alface.avif").
export function resolveImagePath(path = '') {
  const file = path.split('/').pop().replace(/\.[^.]+$/, '').toLowerCase()
  return bySlug[file] || ''
}
