# Site de documentação do Launcher Toolkit

Este diretório contém o site Astro/Starlight publicado em
<https://emaclab.github.io/launcher-toolkit/>. A raiz do repositório mantém
as instruções de uso, os exemplos e a distribuição do toolkit; Node.js é
necessário somente para desenvolver este site.

## Desenvolvimento local

Use Node.js 24 LTS e npm. A partir da raiz do repositório:

```sh
cd .github/pages
npm ci
npm run dev
```

Abra <http://localhost:4321/launcher-toolkit/>. Para compilar e conferir a
versão estática, execute neste diretório:

```sh
npm run build
npm run preview
```

Os arquivos gerados ficam em `dist/`, os caches e tipos do Astro em `.astro/`
e as dependências em `node_modules/`, todos locais a este diretório e ignorados
pelo Git. O lockfile, a configuração npm e as configurações Astro/TypeScript
também pertencem somente ao site.

## Conteúdo e publicação

Mantenha os guias públicos focados nos comandos de autoria, arquivos de packs e
exemplos utilizáveis. Não inclua fontes de implementação, instruções
administrativas, referências a repositórios privados ou credenciais.
Os exemplos executáveis continuam em `../../examples/`, na raiz do repositório.

A resposta para páginas inexistentes fica em `src/pages/404.astro`, usando o
layout e a busca do Starlight. Mantenha a rota 404 injetada pelo Starlight
desabilitada e não adicione `src/content/docs/404.md`, que duplicaria a rota.

O workflow `../workflows/pages.yml` compila alterações em `.github/pages/` ou
no próprio workflow. Pull requests apenas compilam; a branch `main` também
publica. Os comandos npm rodam neste diretório, e o upload usa
`.github/pages/dist/` a partir da raiz do repositório. A URL pública e o prefixo
`/launcher-toolkit/` não mudam. Os links de edição apontam para os fontes em
`.github/pages/`.

O cache guarda downloads npm por versão principal do Node, sistema,
arquitetura e lockfile. Somente builds bem-sucedidos da `main` salvam o cache;
toda execução continua usando `npm ci` e compilando o site.

## Override de segurança das dependências

O site fixa `postcss-selector-parser` **7.1.6** somente abaixo de
`@expressive-code/core@0.44.2` → `postcss-nested@6.2.0` para corrigir
[GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf).
As versões atuais do Starlight/Expressive Code ainda solicitam o parser 6 nessa
cadeia. O parser 7 preserva as APIs síncronas de parsing, clonagem, substituição
e combinadores usadas aqui, com a mesma versão mínima de Node.js e dependências.
Ele já é usado pelo
[postcss-nested 7 com o mesmo código de interpolação](https://github.com/postcss/postcss-nested/blob/7.0.0/index.js).
A [mudança do iterador na versão principal](https://github.com/postcss/postcss-selector-parser/commit/4fa6e860a176985e03fda969b2b435fe168f31c2)
não altera as substituições do mesmo nó feitas por esse consumidor; suas
inserções anteriores ocorrem depois da travessia.
Reavalie o override ao atualizar Expressive Code e remova-o quando a faixa de
versões aceita pelo upstream incluir um parser corrigido. Mantenha `npm audit`
habilitado e confira o build após alterações nas dependências.

## Aviso upstream do deploy no Pages

A action oficial `actions/deploy-pages@v5.0.1` pode emitir Node.js `DEP0040`
por sua dependência embarcada `punycode`, mesmo quando o deploy funciona.
O problema é acompanhado em
[actions/deploy-pages#434](https://github.com/actions/deploy-pages/issues/434).
Isso é separado do build do site, que deve continuar sem avisos. Preserve a
action oficial fixada; não suprima avisos do Node.js nem reduza a versão do
runtime. Atualize o pin quando o upstream corrigir a dependência embarcada.
