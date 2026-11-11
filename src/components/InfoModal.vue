<template>
  <div class="overlay" @mousedown.self="$emit('close')">
    <section class="modal" role="dialog" aria-label="Sobre o projeto">
      <header class="top">
        <h2>Sobre o projeto</h2>
        <button class="close" aria-label="Fechar" @click="$emit('close')"><Icon name="x" :size="16" /></button>
      </header>

      <div class="body">
        <p v-if="storageStatus.failed" class="alert" role="alert">
          <Icon name="info" :size="15" />
          <span>
            O navegador não conseguiu salvar suas últimas mudanças (o armazenamento deve estar cheio).
            Baixe um backup agora e, se puder, apague ingredientes com imagem que você não usa.
          </span>
        </p>

        <section class="block">
          <h3>O que é</h3>
          <p>
            O Burger Blue Print ajuda a padronizar a montagem dos lanches da sua hamburgueria. Você escolhe os
            ingredientes de cada lanche, organiza tudo e gera folhas prontas para imprimir ou salvar, para que
            quem monta na cozinha siga sempre o mesmo padrão.
          </p>
          <p>
            O projeto faz parte de um ecossistema open source em desenvolvimento, pensado para todos que trabalham
            em restaurantes: donos, cozinheiros e equipes. A ideia é ter ferramentas abertas, que qualquer pessoa
            possa usar, estudar e melhorar.
          </p>
          <p>
            O que você está usando agora é a Community Edition: gratuita, roda no seu navegador e não pede cadastro.
            Como todos os projetos do ecossistema na versão da comunidade, ela tem limitações, mas a maioria das
            funcionalidades funciona.
          </p>
          <p>
            O projeto ainda não foi adaptado para celular nem para telas com resolução menor que 1920×1080
            (Full HD). Em telas menores, o layout pode ficar apertado ou cortado, então use em um computador.
          </p>
          <p>
            Outra limitação é a biblioteca de ingredientes. Aqui você encontra um conjunto básico de imagens, o
            suficiente para o programa ser útil desde o primeiro uso. A versão completa vai trazer mais de 100
            imagens prontas para criar os manuais. Isso não impede você de ir além: na Community Edition, você pode
            cadastrar os seus próprios ingredientes, com nome, categoria e imagem.
          </p>
          <p>
            A versão completa, hospedada em servidor, ainda não existe, mas o autor, Vinnycios Medeiros, pretende
            lançá-la eventualmente.
          </p>
          <p>
            Sugestões são muito bem-vindas. Se você tem uma ideia, encontrou um problema ou quer um ingrediente novo
            na biblioteca, abra uma issue ou um Pull Request no GitHub.
          </p>
        </section>

        <section class="block">
          <h3>Como usar</h3>
          <ol>
            <li><strong>Montar lanches:</strong> escolha os ingredientes, dê um nome ao lanche e organize os manuais na prancheta.</li>
            <li><strong>Gerar manual:</strong> ajuste papel, margens e guias por folha e salve em PDF ou PNG.</li>
          </ol>
        </section>

        <section class="block">
          <h3>Onde ficam os seus dados</h3>
          <p>
            Tudo fica <strong>somente neste navegador</strong>. Nada é enviado para servidor nenhum. Isso significa que:
          </p>
          <ul>
            <li>os dados não passam sozinhos para outro computador, celular ou outro navegador;</li>
            <li>limpar os dados do site, ou usar uma janela anônima, apaga os lanches e os ingredientes;</li>
            <li>o espaço é limitado (cerca de 5 MB), e as imagens dos ingredientes que você cadastra ocupam a maior parte.
              Cadastre só as imagens que for usar e prefira arquivos pequenos (avif, webp, jpeg).</li>
          </ul>
        </section>

        <section class="block">
          <h3>Backup</h3>
          <p>
            Baixe um backup de vez em quando. O arquivo guarda seus lanches, ingredientes cadastrados, edições,
            categorias e preferências, e serve para recuperar tudo em outro navegador.
          </p>
          <div class="row">
            <button class="btn primary" @click="doDownload"><Icon name="download" :size="14" /> Baixar backup</button>
            <button class="btn" @click="fileInput.click()"><Icon name="upload" :size="14" /> Importar backup</button>
            <input ref="fileInput" type="file" accept="application/json,.json" hidden @change="onFile" />
          </div>
          <p v-if="message" class="message" :class="{ error: messageIsError }">{{ message }}</p>
        </section>

        <section class="block">
          <h3>Contribuir</h3>
          <p>
            Quer sugerir ingredientes para todo mundo? Abra um Pull Request no
            <a href="https://github.com/VinnyciosM/burger-blue-print-v2" target="_blank" rel="noopener">GitHub</a>
            com a imagem em <code>src/assets/ingredientes</code> e o ingrediente no <code>src/ingredientes.json</code>.
          </p>
        </section>
      </div>
    </section>

    <ConfirmModal v-if="pending" title="Importar este backup?"
      :message="`Isso substitui os lanches e ingredientes atuais deste navegador pelos do arquivo (${pending.snacks.length} ${pending.snacks.length === 1 ? 'lanche' : 'lanches'}, ${pending.custom.length} ${pending.custom.length === 1 ? 'ingrediente próprio' : 'ingredientes próprios'}). Baixe um backup antes se quiser guardar o que existe agora.`"
      confirm-label="Importar" @confirm="doImport" @cancel="pending = null" />
  </div>
</template>

<script setup>
import Icon from './Icon.vue'
import ConfirmModal from './ConfirmModal.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { storageStatus, reportStorageError } from '../storageStatus.js'
import { downloadBackup, readBackupFile, applyBackup } from '../backup.js'

const emit = defineEmits(['close'])

const fileInput = ref(null)
const pending = ref(null)
const message = ref('')
const messageIsError = ref(false)

const say = (text, isError = false) => { message.value = text; messageIsError.value = isError }

function doDownload() {
  downloadBackup()
  say('Backup baixado. Guarde o arquivo em um lugar seguro.')
}

async function onFile(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  try {
    pending.value = await readBackupFile(file)
    message.value = ''
  } catch (error) {
    say(error.message, true)
  }
}

function doImport() {
  try {
    applyBackup(pending.value)
  } catch (error) {
    reportStorageError(error)
    pending.value = null
    say('Não foi possível importar: o armazenamento do navegador está cheio.', true)
    return
  }
  // Recarrega para o app abrir já com os dados importados
  location.reload()
}

const onKey = (e) => { if (e.key === 'Escape' && !pending.value) emit('close') }
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.55);
  font-family: var(--font);
}

.modal {
  display: flex;
  flex-direction: column;
  width: 560px;
  max-width: calc(100vw - 32px);
  height: min(720px, calc(100vh - 48px));
  padding: 22px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 18px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  color: var(--text);
}

.top { flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
h2 { margin: 0; font-size: 1.15rem; }

.close {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
}
.close:hover { color: var(--text); border-color: var(--border-strong); }

.body { flex: 1; min-height: 0; overflow-y: auto; padding-right: 6px; }

.block + .block { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border); }

h3 {
  margin: 0 0 8px;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

p, li { font-size: 0.82rem; line-height: 1.5; color: var(--text-muted); }
p { margin: 0 0 8px; }
ul, ol { margin: 0; padding-left: 20px; }
li + li { margin-top: 4px; }
strong { color: var(--text); }
a { color: var(--accent); font-weight: 700; }
code { padding: 1px 5px; background: var(--bg); border-radius: 4px; font-size: 0.75rem; color: var(--text); }

.alert {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin: 0 0 18px;
  padding: 10px 12px;
  background: linear-gradient(var(--accent-soft), var(--accent-soft)), var(--surface);
  border: 1px solid var(--accent);
  border-radius: 10px;
  color: var(--text);
  font-weight: 600;
}
.alert .icon { margin-top: 2px; color: var(--accent); }

.row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  background: transparent;
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  color: var(--text);
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}
.btn:hover { border-color: var(--accent); color: var(--accent); }
.btn.primary { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
.btn.primary:hover { color: var(--on-accent); filter: brightness(1.08); }

.message { margin: 10px 0 0; font-size: 0.75rem; }
.message.error { color: #ff6b6b; }
</style>
