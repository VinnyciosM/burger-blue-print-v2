# Burger Blue Print v2

Ferramenta open source para criar manuais operacionais de montagem para hamburguerias (Vue 3 + Vite, SPA).
Criador: Vinnycios Medeiros (GitHub: VinnyciosM). Repositório: https://github.com/VinnyciosM/burger-blue-print-v2
(O repositório `burger-blue-print` sem "v2" é a primeira tentativa, abandonada, mantida só como registro.)

## Regras de trabalho com o dono do projeto

- **Não faça operações de git** (commit, push, merge, reset...). O dono cuida do git. Sem linhas de coautoria/atribuição nos commits.
- Analise antes de mudanças grandes e apresente o plano; não remova funcionalidades sem justificar; sem limitações artificiais.
- Responda em português do Brasil, de forma simples (o dono não é programador de carreira).
- Visual: minimalista, ícones SVG (componente `src/components/Icon.vue`), **sem emojis na interface**. Sem sombreados/relevos exagerados.

## Produto

- **Community Edition** (este repositório): gratuita, roda local no navegador, dados no localStorage.
- **Hosted Edition**: versão hospedada futura; manter a estrutura pronta para isso, sem misturar com a Community.
- Licença **ainda não decidida** (AGPL foi discutida). Marca é separada da licença. O rodapé do app diz "Todos os direitos reservados" provisoriamente: ajustar quando a licença for escolhida.
- README ainda é o padrão do template Vue: precisa ser reescrito (simples, em PT-BR, para dono de restaurante, com área de download, histórico da v1, Community vs Hosted).

## Comandos

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # valida a compilação
```

## Telas e conceitos

- **1 Montar lanches**: coluna de ingredientes (esq.) | editor do lanche (nome + lista de ingredientes) | canvas | lista de lanches (dir.).
- **2 Gerar manual**: folhas A4 em tamanho real + painel de configurações (orientação, guias por folha 1–3, margens por orientação, espaçamento, serrilhado) e botão GERAR PDF (usa `window.print()` → "Salvar como PDF").
- **Canvas tem dois modos** (alternador no canto superior esquerdo, salvo em `manualburger_canvas_mode`):
  - **Foco**: o canvas clássico, mostra só o lanche selecionado.
  - **Mesa** (padrão): área de trabalho pontilhada infinita; cada lanche é um manual independente (tamanho **fixo** 320×560), com zoom (roda do mouse), pan (arrastar o fundo), seleção múltipla (Shift/Ctrl+clique, botão "Todos"), ocultar/bloquear, ordem (‹ ›), e **guias inteligentes** (linhas vermelhas + encaixe ao arrastar). Os ingredientes **não** são camadas livres: a camada é o manual inteiro.
- A **ordem da lista** de lanches = ordem de impressão = ordem de empilhamento na Mesa. "Ocultar" vale só no canvas (o lanche oculto ainda vai para o PDF). Posições da Mesa não entram no PDF.

## Estrutura (src/)

- `App.vue`: estado global (lanches, impressão), tokens de design/tema, CSS de impressão (`@media print`), desfazer exclusão.
- `workspace.js`: constantes e posicionamento dos manuais na Mesa; câmera (`view`) compartilhada.
- `theme.js`: modo claro/escuro/sistema + cor principal (variáveis CSS `--accent*`).
- `ingredientes.json` + `assets/ingredientes/*.avif`: biblioteca base (39 itens). `ingredientImages.js` resolve as imagens (`import.meta.glob`).
- `customIngredients.js`: ingredientes cadastrados/editados pelo usuário (localStorage) + exportar/importar `ingredientes.json`.
- `components/`: `NavBar`, `AppearanceMenu`, `IngredientSidebar`, `LibraryModal`, `AddIngredientModal`, `ProductEditor`, `WorkspaceCanvas` (Mesa), `GuideManager` + `SnackList` (lista/camadas), `PrintCanvas`, `PrintSettingsSidebar`, `Icon`.

## Persistência (localStorage)

`manualburger_snacks`, `manualburger_active_id`, `manualburger_theme`, `manualburger_custom_ingredients`, `manualburger_library_edits`, `manualburger_canvas_mode`.
Cada lanche guarda também `x, y, w, h, hidden, locked` (posição na Mesa). O navegador não escreve arquivos do projeto: edições da biblioteca são exportadas via "Baixar ingredientes.json".

## Pendências / ideias

- Escolher licença; reescrever README; CONTRIBUTING; exportar/importar projeto completo.
- Opcional: largura fixa (~99 mm) dos cartões em retrato no PDF; título do card da lista ocupar toda a largura (botões só no hover).
- Layout fica apertado em telas < ~1500 px (canvas da Mesa estreito).
- Janela real de impressão nunca foi testada de ponta a ponta (apenas simulação do `@media print`).
