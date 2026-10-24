# Starter do launcher

Projeto único de exemplo para jogos integrados ao **EMAC Anti-Cheat**, sempre com todos os widgets disponíveis, janela 1120 × 630 e páginas Home, News, Updates, Calendar, Servers, About e Settings. Inclui carrossel, Markdown, pesquisa, paginação, calendário recorrente, status de servidores, settings persistentes, ações de lançamento e splash. Usa CSS comum, traduções pt/en/es, formato `1` e core API `3`.

> **Uso restrito.** Não é open source. Use somente em jogos integrados ao EMAC Anti-Cheat e preserve [`LICENSE`](LICENSE) em derivados. A licença prevalece sobre este resumo; direitos de terceiros permanecem válidos.

## Criar ou abrir

Com Launcher Toolkit no Windows x64, crie um destino vazio:

```powershell
launcher-toolkit.exe init my-game
```

Para automação, acrescente `--name "My Game" --game-id my-game --non-interactive`. O starter vem da mesma versão do toolkit, com download verificado. Se já extraiu o ZIP, ele já é um projeto: não execute `init` sobre os arquivos.

O pin `.toolkit-version` exige a versão correspondente. Para obter o executável a partir de um ZIP de starter, execute na raiz do projeto. A tag precisa existir no [release público](https://github.com/emaclab/launcher-toolkit/releases).

```powershell
$ErrorActionPreference = 'Stop'
$tag = [IO.File]::ReadAllText((Join-Path $PWD '.toolkit-version')).Trim()
if ($tag -cnotmatch '^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$') {
    throw 'Pin de versão inválido.'
}
$asset = 'launcher-toolkit-windows-x64.exe'
$headers = @{ Accept = 'application/vnd.github+json'; 'X-GitHub-Api-Version' = '2022-11-28' }
$release = Invoke-RestMethod "https://api.github.com/repos/emaclab/launcher-toolkit/releases/tags/$tag" -Headers $headers
$entry = @($release.assets | Where-Object { $_.name -ceq $asset })
if ($release.tag_name -cne $tag -or $entry.Count -ne 1) { throw 'Release ou asset inesperado.' }
if ($entry[0].digest -cnotmatch '^sha256:[0-9a-fA-F]{64}$' -or "$($entry[0].size)" -cnotmatch '^[1-9][0-9]*$') {
    throw 'Metadados de integridade inválidos.'
}
New-Item -ItemType Directory -Path .tools -Force | Out-Null
$file = Join-Path $PWD ".tools/$asset"
Invoke-WebRequest "https://github.com/emaclab/launcher-toolkit/releases/download/$tag/$asset" -OutFile $file
if ((Get-Item -LiteralPath $file).Length -ne [long]$entry[0].size -or
    (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash -ine $entry[0].digest.Substring(7)) {
    throw 'Tamanho ou SHA-256 do toolkit diverge.'
}
Move-Item -LiteralPath $file -Destination .tools/launcher-toolkit.exe -Force
```

O script confere tamanho/hash antes de expor o executável em `.tools/launcher-toolkit.exe`. Use-o portavelmente ou instale por usuário:

```powershell
.\.tools\launcher-toolkit.exe install
```

Não exige administrador; instala em `%USERPROFILE%\.local\bin` e atualiza PATH do usuário. Abra novo terminal. Nos comandos abaixo, o modo portátil substitui `launcher-toolkit.exe` por `.\.tools\launcher-toolkit.exe`.

## Preview, checks e build

Na raiz do projeto:

```powershell
launcher-toolkit.exe dev pack
launcher-toolkit.exe check pack
launcher-toolkit.exe check pack --json
launcher-toolkit.exe build pack --out dist/pack.zip
launcher-toolkit.exe reference --out reference.md
```

`dev` abre preview/painel, hot reload e cenários explícitos de idiomas, fases, feed, relógio e falhas. `check` cobre schemas, templates, renderizações, traduções, recursos, widgets, região e marca. `build` executa checks antes de produzir ZIP determinístico e relatório JSON; erros bloqueiam output e warnings permanecem não fatais. `--out-dir dist/pack` permite inspecionar os mesmos bytes, substituindo somente pasta vazia ou marcada por build anterior.

Preview não executa SDK/driver ou sincronização reais. O painel bloqueia o download com processos de exemplo e falha check ou lançamento; assim se testam todos os estados da launch bar. Cada ação aparece só no estado em que o core a aceita: `force_close()` (confirmado em `dialogs.html`, com a lista de `launcher.blocked.processes`) e `retry()` em `blocked`; `repair()` e `retry()` com `launcher.check_failed` ou em `launch_failed`; `check()` e Play em `ready`, Play somente com anti-cheat `ready` e `retry()` no lugar dele com anti-cheat `error`. A página Updates oferece `check()` e `repair()` em `ready`. `anticheat.message` aparece na launch bar e no splash até `retry()`; o splash mostra `launching`/`launched`.

## Arquivos a editar

| Local | Conteúdo |
| --- | --- |
| `pack/pack.json` | Identidade, hosts/links, requisitos, idiomas, páginas, documentos e estado |
| `pack/window.json` | Dimensões, títulos, ícone, polígono e splash |
| `pack/templates/` | Layout/launch bar/dialogs e páginas |
| `pack/styles/app.css` | Estilo pronto para o runtime |
| `pack/i18n/` | Textos e formatos pt/en/es |
| `pack/data/` | slides, news, releases, calendar, events, servers e faq |
| `pack/assets/` | Ícone, arte e imagens próprias |
| `examples/` | Feed, região de janela e preferências de exemplo, fora do ZIP do pack |

Use o `game.id` atribuído no onboarding e escolha o nome final antes da distribuição: ele determina a pasta de dados do jogador. Substitua `example.com` em links/dados/allowed_hosts. Links externos exigem HTTPS e host permitido ou subdomínio.

Declare cada página/documento/idioma antes de usá-lo. Idioma padrão fornece fallback, mas mantenha chaves de tradução alinhadas. Dados localizados podem ser objetos como `{"pt":"Notícias","en":"News","es":"Noticias"}`. `asset('images/file.svg')` recebe caminho relativo a assets.

## Padrões e regras

| Padrão | Exemplo em `pack/templates/` |
| --- | --- |
| Carrossel, scroll e countdown | `pages/home.html` |
| Pesquisa/listas/Markdown | `pages/news.html`, `pages/about.html` |
| Paginação/tabs | `pages/updates.html` |
| Calendário/modal | `pages/calendar.html`, `dialogs.html` |
| Dropdowns/settings | `layout.html`, `pages/settings.html` |
| Tooltip/status | `launch-bar.html`, `pages/settings.html` |
| Toast e erros do core | `layout.html` |
| Fases e ações de lançamento | `launch-bar.html`, `dialogs.html`, `pages/updates.html`, `splash.html` |
| Marca obrigatória | `splash.html` |

Templates usam MiniJinja, autoescape e ações `data-on-*`, não JavaScript. `safe`, blocos autoescape, scripts, iframes, forms e atributos `onclick` não são permitidos. Interpolação em ação termina em `|arg`.

Use chaves `data-key`/IDs estáveis em irmãos condicionais. Renderize menus/controles fechados condicionalmente para que não recebam foco. Para settings, declare tipo/default válido; `persist:true` salva, `reset:"page"` limpa temporários e `set(name,null)` restaura default. `pick_folder` armazena caminho sem dar acesso a arquivos.

Mantenha exatamente um placeholder `anticheat-mark` no splash, mínimo 120 × 24 px lógicos e dentro da janela/polígono. O core fornece a imagem. `window.json` e `clip-path` raiz devem ter a mesma geometria. O renderer não implementa todo CSS de navegador: confira visualmente no preview.

Ao adicionar um widget ao core, inclua um exemplo funcional neste starter. O teste `starter_renders_every_available_widget` compara os widgets presentes nas páginas e no splash renderizados com o catálogo público; modais e toasts também são exercitados.

## Exemplos de configuração

- `examples/feed.json`: substitui documentos declarados inteiros, não campos internos; offline conserva dados locais. Ative por `feed.url` HTTPS e intervalo em `pack.json`.
- `calendar` e `servers` têm schemas fixos. Estado de servidor é `online`, `maintenance` ou `offline`; descrição/link de evento ficam em `events`.
- `examples/window-polygon.json` e `examples/polygon.css`: exemplo combinado de janela/região; preserve correspondência entre ambos.
- `examples/preferences.json`: dados do usuário, nunca parte de `pack/`.

## CSS, CI e publicação

CSS comum dispensa compilador. Se escolher preprocessor, siga o [CLI oficial do Tailwind](https://tailwindcss.com/docs/installation/tailwind-cli), guarde input fora de `pack/` e rode separadamente. Preserve regras próprias antes de sobrescrever `pack/styles/app.css`. Toolkit não gerencia compiladores; comite CSS pronto e mantenha `.gitattributes`.

O workflow incluído roda no Windows em pushes/PRs. Lê `.toolkit-version`, verifica tamanho/hash do toolkit público, faz build e envia `dist/` como artifact. Não assina, publica ou recebe secrets do fornecedor. O ZIP contém a raiz do projeto diretamente, não uma pasta externa de repositório.

Atualize explicitamente com `launcher-toolkit.exe update --version vX.Y.Z`, revise o pin e execute checks; a tag deve estar publicada. Onboarding/App/cadastro ativos conectam o push da branch padrão à publicação do fornecedor. Não adicione keys/tokens administrativos. Build local não cria launcher executável ou instalador.

Consulte o [manual de autoria](https://emaclab.github.io/launcher-toolkit/) e releases correspondentes para a referência da versão instalada.
