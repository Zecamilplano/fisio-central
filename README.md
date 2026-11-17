# Sistema de Gestão de Pacientes para Fisioterapia

Aplicação web desenvolvida para auxiliar fisioterapeutas no gerenciamento de pacientes, sessões, pacotes de tratamento e controle de pagamentos.

## Funcionalidades

- Cadastro e visualização de pacientes
- Gerenciamento de sessões avulsas e pacotes
- Controle de status das sessões (Realizada/Pendente)
- Controle de pagamentos (Pago/Pendente/Cancelado)
- Agendamento automático de sessões
- Histórico de pacotes
- Interface responsiva

## Tecnologias Utilizadas

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase (Auth, Postgres, Storage)
- Zustand
- Date-fns
- Lucide React
- ESLint e Vitest

## Requisitos

Antes de iniciar, certifique-se de possuir instalado:

- Node.js 20+
- yarn 1.x (o projeto usa `yarn.lock`; não use `npm install`, para não gerar um segundo lockfile)

## Instalação

Clone o repositório:

```bash
git clone git@github.com:Zecamilplano/fisio-central.git
```

Acesse a pasta do projeto:

```bash
cd fisio-central
```

Instale as dependências:

```bash
yarn install
```

## Executando o Projeto

Inicie o servidor de desenvolvimento:

```bash
yarn dev
```

A aplicação estará disponível em:

```text
http://localhost:3000
```

## Scripts

| Comando | O que faz |
|---|---|
| `yarn dev` | servidor de desenvolvimento |
| `yarn build` | build de produção |
| `yarn lint` | ESLint |
| `yarn typecheck` | checagem de tipos (`tsc --noEmit`) |
| `yarn test` | testes (Vitest) |
| `yarn test:watch` | testes em modo observação |

## Estrutura do Projeto

```text
src/
├── app/          # rotas (App Router)
├── components/   # componentes de tela
├── data/         # constantes e dados iniciais de formulários
├── hook/         # hooks de formulário e fluxo
├── lib/          # Supabase, autenticação, perfil e regras da clínica
├── services/     # acesso ao banco (repositórios)
├── store/        # estado global (Zustand)
├── types/        # tipos TypeScript
└── utils/        # funções puras (datas, agenda, imagens)
supabase/migrations/  # migrations do banco
```

## Autor

Desenvolvido por Ezequiel Santos como projeto de extensão acadêmica.
