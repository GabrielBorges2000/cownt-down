# cownt-down

Aplicativo Electron com React, TypeScript, TailwindCSS, Shadcn/UI, React Router, Lucide React e Class Variance Authority.

## IDE recomendada

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Setup do projeto

### Instalação

```bash
$ npm install
```

### Desenvolvimento

```bash
$ npm dev
```

### Build

```bash
# Para Windows
$ npm build:win

# Para macOS
$ npm build:mac

# Para Linux
$ npm build:linux
```
# Como rodar este workflow no GitHub Actions

Este workflow é configurado para ser executado automaticamente quando você cria um *tag* que começa com "v". Ele realiza a liberação de um aplicativo Electron em diferentes sistemas operacionais.

## Pré-requisitos

1. Certifique-se de que você configurou um *secret* chamado `GITHUB_TOKEN` no seu repositório.
2. O aplicativo deve estar configurado para funcionar com o [Electron Builder](https://www.electron.build/).

## Estrutura do Workflow

Este workflow suporta os seguintes sistemas operacionais:
- Ubuntu (Linux)
- macOS
- Windows

## Configuração

Copie o código abaixo para um arquivo chamado `release.yml` no diretório `.github/workflows` do seu repositório:

```yaml
on:
  push:
    tags: ["*"]

jobs:
  release:
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Install Node.js, NPM and Yarn
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: apt-update
        if: startsWith(matrix.os, 'ubuntu-latest')
        run: sudo apt-get update

      - name: autoremove
        if: startsWith(matrix.os, 'ubuntu-latest')
        run: sudo apt autoremove

      - name: Install libarchive rpm on Linux
        if: startsWith(matrix.os, 'ubuntu-latest')
        run: sudo apt-get install libarchive-tools rpm

      - name: Release Electron app
        uses: samuelmeuli/action-electron-builder@v1
        with:
          github_token: ${{ secrets.github_token }}
          release: true
```

## Como funciona

### Disparo
```bash
# Certifique-se de que está no branch correto
git checkout main

# Atualize o branch com as últimas alterações
git pull origin main

# Faça o commit das alterações e crie uma tag no mesmo comando
# Crie uma tag com o formato esperado (começando com "v")
# Substitua "v1.0.0" pelo número da versão desejada
git commit -m "Nova versão: v1.0.0" && git tag v1.0.0

# Envie o commit e a tag para o repositório remoto
git push origin main --tags

```
### O que o workflow faz?

1. **Disparo**: O workflow é iniciado automaticamente quando um tag que corresponde ao padrão definido (*) é criado.

2. **Execução em diferentes SOs**: Utiliza a matriz de estratégias para rodar em ubuntu-latest, macos-latest e windows-latest.

3. **Etapas do workflow**: 


 - Checkout do código fonte
 - Configuração do ambiente Node.js
 - Atualização de pacotes no Linux  
 - Instalação de dependências específicas
 - Build e publicação do app


