# Burger Blue Print v2

Ferramenta open source para criar **manuais operacionais de montagem** para hamburguerias.

Com ela, você escolhe os ingredientes de cada lanche, organiza tudo e gera folhas prontas para imprimir ou salvar em PDF e PNG. Assim, quem monta na cozinha segue sempre o mesmo padrão.

**[Acessar o site](https://vinnyciosm.github.io/burger-blue-print-v2/)**, sem instalar nada e sem cadastro.

## Sobre o projeto

O Burger Blue Print faz parte de um ecossistema open source em desenvolvimento, pensado para todos que trabalham em restaurantes: donos, cozinheiros e equipes. A ideia é ter ferramentas abertas, que qualquer pessoa possa usar, estudar e melhorar.

Este repositório contém a **Community Edition**: gratuita e executada inteiramente no navegador. Como todos os projetos do ecossistema na versão da comunidade, ela tem limitações, mas a maioria das funcionalidades funciona. As diferenças em relação à versão completa estão [mais abaixo](#community-edition-e-versão-completa).

> **Aviso:** o projeto **não foi adaptado para celular** nem para telas com resolução menor que **1920×1080** (Full HD). Em telas menores, o layout pode ficar apertado, cortado ou difícil de usar. Use em um computador.

## Funcionalidades

- **Biblioteca de ingredientes** com imagens, organizada por categorias. Você pode cadastrar os seus próprios ingredientes (nome, categoria e imagem), editar ou apagar os existentes e personalizar a ordem e a exibição das categorias.
- **Montagem de lanches:** adicione ingredientes ao clicar, reordene arrastando e escreva observações (por exemplo, "sem cebola").
- **Prancheta:** veja todos os manuais lado a lado, com zoom, e organize a ordem. Também há o modo **Individual**, que mostra um lanche por vez.
- **Ocultar e bloquear lanches:** um lanche oculto fica de fora do manual gerado, e um lanche bloqueado não pode ser editado.
- **Geração do manual:** escolha a orientação do papel (A4), as margens, quantas guias cabem por folha e o serrilhado de corte.
- **Salvar em PDF ou PNG:** o PNG sai com uma imagem por folha, em alta qualidade (300 DPI), e dá para escolher quais folhas salvar.
- **Backup completo** dos seus dados em um único arquivo.

## Como usar

1. **Montar lanches:** na coluna da esquerda, clique nos ingredientes para adicioná-los ao lanche. Dê um nome a ele e arraste os ingredientes para mudar a ordem.
2. **Gerar manual:** escolha papel, margens e guias por folha. Depois, clique em **Salvar** e escolha PDF ou PNG.

Recomendado usar em um computador com tela de pelo menos 1920×1080, no Chrome ou no Edge (os testes foram feitos neles). O projeto ainda não foi adaptado para celular.

## Seus dados

Tudo fica salvo no seu computador. Nada é enviado para a nuvem nem para nenhum servidor: lanches, ingredientes e configurações ficam guardados dentro do navegador (`localStorage`). Isso traz privacidade, porque ninguém mais vê o que você criou, mas também tem consequências:

- Se você **apagar os dados de navegação**, limpar os dados do site ou usar uma **janela anônima**, tudo o que criou será apagado.
- Os dados **não passam sozinhos** para outro computador, celular ou navegador.
- O espaço é limitado (cerca de 5 MB). As imagens dos ingredientes cadastrados ocupam a maior parte, então cadastre só as que for usar e prefira arquivos pequenos (avif, webp, jpeg).

**Faça backup de vez em quando:** clique em **Sobre**, na barra de cima, e depois em **Baixar backup**. O arquivo guarda lanches, ingredientes cadastrados, categorias e preferências. Para recuperar tudo em outro navegador, use **Importar backup**.

## Rodar no seu computador

Requisito: [Node.js](https://nodejs.org) 22 ou mais novo.

1. Baixe o projeto (**Code > Download ZIP** aqui no GitHub e extraia, ou use `git clone`).
2. Dentro da pasta, rode:

```bash
npm install
npm run dev
```

3. Abra o endereço que aparecer no terminal (normalmente `http://localhost:5173`).

Para gerar a versão final, a mesma que vai para o site, use `npm run build`. Os arquivos ficam na pasta `dist`.

## Community Edition e versão completa

| | Community Edition (este repositório) | Versão completa (planejada) |
|---|---|---|
| Situação | Disponível | **Ainda não existe.** O autor pretende lançá-la eventualmente |
| Custo | Gratuita | A definir |
| Onde roda | No navegador | Hospedada em servidor |
| Onde ficam os dados | No navegador de quem usa | No servidor, acessíveis de qualquer lugar |
| Biblioteca de ingredientes | Conjunto básico de imagens, mais os que você cadastrar | Mais de 100 imagens prontas |
| Funcionalidades | A maioria, com limitações | Completa |

A biblioteca da Community Edition traz imagens suficientes para o programa ser útil desde o primeiro uso, e você pode ir além cadastrando os seus próprios ingredientes.

## Contribuindo

**Sugestões são muito bem-vindas.** Se você tem uma ideia, encontrou um problema ou quer um ingrediente novo na biblioteca, abra uma [issue](https://github.com/VinnyciosM/burger-blue-print-v2/issues) ou um Pull Request.

Para sugerir ingredientes com imagem ou mexer no código, veja o [CONTRIBUTING.md](CONTRIBUTING.md).

## Histórico

Este é o **v2** do projeto. O repositório [`burger-blue-print`](https://github.com/VinnyciosM/burger-blue-print) (sem o "v2") foi a primeira tentativa, abandonada, e fica apenas como registro.

## Licença

Copyright (C) 2026 Vinnycios Medeiros.

Este projeto é distribuído sob a licença **GNU Affero General Public License v3.0 ou posterior** (AGPL-3.0-or-later). O texto completo está no arquivo [LICENSE](LICENSE).

Em resumo:

- **Usar é livre.** Você pode usar o programa, inclusive no seu restaurante e para fins comerciais, sem pedir autorização e sem pagar nada.
- **Estudar e modificar é livre.** O código é aberto.
- **Compartilhar tem uma regra.** Se você modificar o programa e disponibilizá-lo para outras pessoas, seja distribuindo cópias ou oferecendo como serviço na internet, precisa publicar o código modificado sob a mesma licença e indicar onde ele está.

Isso vale para o código deste repositório. O nome "Burger Blue Print" e a versão completa planejada são tratados separadamente. Este resumo não substitui o texto da licença.

---

Criado por [Vinnycios Medeiros](https://github.com/VinnyciosM).
