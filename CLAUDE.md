# Allos Editorial — Calendário Editorial Instagram

## Visão Geral

App interno para planejamento e controle de conteúdo do Instagram da Associação Allos.
**Não é** um agendador automático. **Não** armazena imagens. **Não** puxa métricas.
É puramente um **centro de comando editorial**: planejar, organizar, acompanhar status.

O fluxo real: planeja aqui → cria o visual no Canva → agenda no Meta Business Suite → volta aqui e marca como publicado.

## Usuários

- **Victor** (coordenação, visão estratégica)
- **Arthur** (comunicação, criação de conteúdo)

Autenticação simples: login com usuário/senha hardcoded ou variável de ambiente. Sem OAuth, sem registro. São 2 pessoas.

## Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: FastAPI (Python)
- **Banco**: Supabase (PostgreSQL)
- **Deploy**: Railway (monorepo ou dois serviços separados)

## Modelo de Dados

### Post

```
id: integer (PK, autoincrement)
titulo: string — nome interno do post (ex: "Carrossel Casas - Prisma")
tipo: enum — "carrossel" | "reels" | "stories" | "estatico"
pilar: enum — "casas" | "educativo" | "institucional" | "bastidores" | "projeto_social" | "outro"
caption: text — rascunho do texto do post
link_canva: string (nullable) — URL do design no Canva
data_planejada: datetime — quando deve ser publicado
status: enum — "ideia" | "criando" | "aprovado" | "agendado" | "publicado" | "cancelado"
criado_por: string — "victor" | "arthur"
notas: text (nullable) — observações internas
created_at: datetime
updated_at: datetime
```

## Funcionalidades

### 1. Visão Calendário (tela principal)

- Calendário mensal mostrando os posts planejados
- Cada post aparece como card colorido por **pilar** (cores distintas por pilar)
- Indicador visual de **status** (ex: borda, ícone, opacidade)
- Click no card abre detalhes/edição
- Click em dia vazio abre criação de novo post
- Navegação entre meses

### 2. Criação/Edição de Post

- Formulário com todos os campos do modelo
- Campo de caption com textarea grande (o caption é o conteúdo mais importante)
- Link do Canva como campo de URL (com botão pra abrir em nova aba)
- Seleção de data/hora com datepicker
- Transição de status com select ou botões rápidos

### 3. Visão Lista (alternativa ao calendário)

- Tabela/lista de todos os posts ordenados por data
- Filtros por: status, pilar, tipo, criado_por
- Útil pra ver "o que tá pendente essa semana"

### 4. Dashboard Simples (nice to have, fase 2)

- Posts planejados vs publicados no mês
- Distribuição por pilar (pra garantir equilíbrio de conteúdo)
- Nada de métricas do Instagram — só dados internos de planejamento

## Design

### Estética

- Dark mode como padrão (consistente com Hamilton e outros apps Allos)
- Paleta: fundo escuro (#0a0a0a / #111), acentos em teal/cyan (identidade Allos)
- Tipografia: clean e legível (Geist, DM Sans, ou similar)
- Cards com bordas sutis, hover states suaves
- Visual editorial, limpo, sem poluição

### Cores por Pilar

- Casas: roxo (#8B5CF6)
- Educativo: azul (#3B82F6)
- Institucional: teal (#14B8A6)
- Bastidores: amber (#F59E0B)
- Projeto Social: rosa (#EC4899)
- Outro: cinza (#6B7280)

### Responsividade

- Desktop-first (uso principal é no computador)
- Mobile funcional mas não precisa ser perfeito

## Estrutura do Projeto

```
allos-editorial/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── models.py            # SQLAlchemy models
│   ├── database.py          # Supabase connection + setup
│   ├── schemas.py           # Pydantic schemas
│   ├── routes/
│   │   └── posts.py         # CRUD de posts
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Calendar.jsx       # Visão calendário mensal
│   │   │   ├── PostCard.jsx       # Card do post no calendário
│   │   │   ├── PostForm.jsx       # Criação/edição
│   │   │   ├── PostList.jsx       # Visão lista com filtros
│   │   │   ├── StatusBadge.jsx    # Badge visual de status
│   │   │   └── PilarTag.jsx       # Tag colorida de pilar
│   │   ├── hooks/
│   │   │   └── usePosts.js        # Hook pra CRUD
│   │   └── lib/
│   │       └── api.js             # Fetch wrapper
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── CLAUDE.md
├── railway.toml
└── README.md
```

## API Endpoints

```
GET    /api/posts              — Lista posts (query params: mes, status, pilar, tipo)
GET    /api/posts/{id}         — Detalhe de um post
POST   /api/posts              — Criar post
PUT    /api/posts/{id}         — Editar post
DELETE /api/posts/{id}         — Deletar post
PATCH  /api/posts/{id}/status  — Atualizar só o status (atalho rápido)
GET    /api/health             — Health check
```

## Deploy no Railway

### Configuração

- **Backend**: Python com FastAPI, porta via `$PORT`
- **Frontend**: build estático servido pelo próprio FastAPI (ou serviço separado)
- **Variáveis de ambiente**:
  - `SUPABASE_URL=https://jhpszzagyiogmtspmdrc.supabase.co`
  - `SUPABASE_ANON_KEY=<ver .env>`
  - `SUPABASE_SERVICE_ROLE_KEY=<ver .env>`
  - `AUTH_USER_VICTOR=<senha>`
  - `AUTH_USER_ARTHUR=<senha>`
  - `ALLOWED_ORIGINS=<url do frontend>`

### railway.toml

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT"
```

## Regras de Negócio

1. Todo post deve ter pelo menos: titulo, tipo, pilar, data_planejada
2. Caption e link_canva podem ser preenchidos depois (fluxo iterativo)
3. Status "publicado" deve registrar automaticamente o updated_at
4. Não permitir deletar post com status "publicado" (soft delete ou bloqueio)
5. Ordenação padrão: data_planejada mais próxima primeiro

## Fases de Desenvolvimento

### Fase 1 — MVP (construir agora)
- Backend CRUD completo
- Visão calendário
- Criação/edição de posts
- Autenticação básica
- Deploy no Railway

### Fase 2 — Refinamento
- Visão lista com filtros
- Dashboard de distribuição de conteúdo
- Drag-and-drop pra reagendar no calendário
- Notificação visual de posts sem caption ou sem link_canva

### Fase 3 — Se/quando fizer sentido
- Integração com Instagram API (leitura de métricas)
- Campo de métricas por post (alcance, engajamento, salvamentos)
- Análise de performance por pilar/tipo
