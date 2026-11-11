# Burger Blue Print v2

Ferramenta gratuita para criar **manuais operacionais de montagem** para hamburguerias.

Você escolhe os ingredientes de cada lanche, organiza tudo e gera folhas prontas para imprimir (PDF) ou salvar como imagem (PNG). Assim, quem monta o lanche na cozinha sempre segue o mesmo padrão.

> Criado por **Vinnycios Medeiros**. Projeto open source, na **Community Edition**.

---

## Usar agora, sem instalar nada

Abra o site no navegador:

**https://vinnyciosm.github.io/burger-blue-print-v2/**

Use no computador, de preferência no Chrome ou no Edge (os testes foram feitos neles). Não precisa de cadastro nem de senha.

## Como usar

1. **Montar lanches**
   - Clique nos ingredientes da coluna da esquerda para adicioná-los ao lanche.
   - Dê um nome ao lanche e arraste os ingredientes para mudar a ordem.
   - Use "Observação" em um ingrediente para escrever um aviso (por exemplo, "sem cebola").
   - Na prancheta você enxerga todos os manuais lado a lado. No modo Individual, vê um de cada vez.
2. **Gerar manual**
   - Escolha a orientação do papel, as margens e quantas guias cabem por folha.
   - Clique em **Salvar** e escolha **PDF** ou **PNG** (uma imagem por folha, em alta qualidade).

## Seus dados ficam no seu navegador

Tudo o que você cria fica **somente no seu navegador**, e nada é enviado para a internet. Isso tem consequências:

- Os dados **não passam sozinhos** para outro computador, celular ou navegador.
- Se você **limpar os dados do site** (ou usar uma janela anônima), os lanches e ingredientes somem.
- O espaço é limitado (cerca de 5 MB). As imagens dos ingredientes que você cadastra ocupam a maior parte.

**Faça backup de vez em quando:** clique em **Sobre**, na barra de cima, e depois em **Baixar backup**. O arquivo guarda seus lanches, ingredientes cadastrados, categorias e preferências. Para recuperar tudo em outro navegador, use **Importar backup**.

## Baixar e usar no seu computador

Se preferir rodar o programa por conta própria:

1. Instale o [Node.js](https://nodejs.org) (versão 22 ou mais nova).
2. No GitHub, clique em **Code > Download ZIP** e extraia a pasta.
3. Abra um terminal dentro da pasta e rode:

```bash
npm install
npm run dev
```

4. Abra o endereço que aparecer no terminal (normalmente `http://localhost:5173`).

Para gerar a versão final (a mesma que vai para o site), use `npm run build`. Os arquivos ficam na pasta `dist`.

## Community Edition e Hosted Edition

| | Community Edition (este repositório) | Hosted Edition (planejada) |
|---|---|---|
| Custo | Gratuita | A definir |
| Onde roda | No seu navegador | Em um site com conta de usuário |
| Onde ficam os dados | No seu navegador | No servidor, acessíveis de qualquer lugar |
| Situação | Disponível | Ainda não existe |

## Histórico

Este é o **v2** do projeto. O repositório [`burger-blue-print`](https://github.com/VinnyciosM/burger-blue-print) (sem o "v2") foi a primeira tentativa, abandonada, e fica apenas como registro.

## Contribuir

Quer sugerir ingredientes novos, corrigir algo ou melhorar o programa? Veja o [CONTRIBUTING.md](CONTRIBUTING.md).

## Licença

A licença do projeto **ainda não foi escolhida**. Até lá, todos os direitos permanecem com o autor. Esta seção será atualizada quando a decisão for tomada.
