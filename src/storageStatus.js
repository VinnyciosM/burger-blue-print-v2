import { reactive } from 'vue'

// Avisa a tela quando o navegador não consegue mais gravar (normalmente: armazenamento cheio)
export const storageStatus = reactive({ failed: false })

export function reportStorageError(error) {
  console.error('Não foi possível salvar no navegador:', error)
  storageStatus.failed = true
}

export function reportStorageOk() {
  storageStatus.failed = false
}
