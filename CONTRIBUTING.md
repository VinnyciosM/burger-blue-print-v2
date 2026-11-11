# Como contribuir

Obrigado pelo interesse! Este guia explica como sugerir ingredientes e como mexer no código.

> A licença do projeto ainda não foi definida. Antes de enviar uma contribuição grande, abra uma *issue* para conversarmos.

## Sugerir um ingrediente novo

A biblioteca base de ingredientes é o arquivo [`src/ingredientes.json`](src/ingredientes.json), com as imagens em [`src/assets/ingredientes`](src/assets/ingredientes). Para propor um ingrediente para todo mundo:

1. **Prepare a imagem.**
   - Formato `.avif` (ou `.png`, `.webp`, `.jpg`). PNG ou AVIF com fundo transparente fica melhor.
   - Imagem leve (idealmente abaixo de 300 KB), com o ingrediente visto de cima e centralizado.
   - O **nome do arquivo** é o nome do ingrediente em minúsculas, sem acentos e com hífen no lugar dos espaços. Exemplo: "Alface e tomate" vira `alface-e-tomate.avif`.
2. **Coloque a imagem** em `src/assets/ingredientes`.
3. **Adicione o ingrediente** no `src/ingredientes.json`, seguindo o formato dos que já existem:

   ```json
   {
     "id": 93,
     "nome": "Gouda",
     "categoria": "queijos",
     "imagem": "assets/ingredientes/gouda.avif"
   }
   ```

   - `id`: um número que ainda não existe no arquivo (use o maior atual + 1).
   - `categoria`: uma das existentes (`paes`, `carnes`, `queijos`, `vegetais`, `molhos`, `outros`).
   - `imagem`: o caminho no formato acima, com o mesmo nome do arquivo.
4. Rode o programa (`npm run dev`) e confira se o ingrediente aparece com a imagem.
5. Abra um **Pull Request** explicando o que foi adicionado.

## Mexer no código

Requisitos: Node.js 22 ou mais novo.

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # confere se tudo compila (rode antes de enviar)
```

### Como o projeto é organizado

- `src/App.vue`: estado geral (lanches, impressão) e estilos globais.
- `src/components/`: as telas e pop-ups. A **prancheta** é o `WorkspaceCanvas.vue`.
- `src/customIngredients.js`: biblioteca de ingredientes (arquivo base + o que a pessoa cadastrou ou editou).
- `src/backup.js`: exportar e importar o backup completo.
- `src/exportPng.js`: salvar as folhas como PNG.

### Regras do projeto

- **Visual minimalista**, sem sombras ou relevos exagerados.
- **Sem emojis na interface.** Use os ícones SVG do componente `src/components/Icon.vue`.
- **Textos em português do Brasil**, simples e diretos (quem usa é dono de restaurante, não programador).
- Os dados ficam no `localStorage` do navegador. Não adicione chamadas a servidores externos na Community Edition.
- Mudanças grandes: abra uma *issue* antes, com o plano.

### Antes de enviar o Pull Request

- [ ] `npm run build` termina sem erros.
- [ ] Você testou a mudança no navegador.
- [ ] Se mexeu em algo que aparece na impressão, conferiu o PDF e o PNG.

## Publicação do site

O site (GitHub Pages) é publicado sozinho a cada atualização da branch `main`, pelo arquivo [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). No repositório, em **Settings > Pages**, a opção **Source** deve estar em **GitHub Actions**.
