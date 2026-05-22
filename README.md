# Auto Quality System

Sistema de qualidade automatizada para plataforma de ensino. Captura, processa e resolve automaticamente problemas reportados por alunos durante aulas interativas.

---

## 📝 Para Candidatos

**Se você está fazendo o teste técnico, leia primeiro o [TECHNICAL_TEST.md](./TECHNICAL_TEST.md)**

Este README documenta o projeto base. O arquivo `TECHNICAL_TEST.md` contém:
- ✅ O que você precisa implementar
- ✅ Casos de teste obrigatórios
- ✅ Critérios de avaliação
- ✅ Prazos e entregáveis

---

## 🏗️ Arquitetura

- **Frontend**: Next.js 14+ App Router com React 19
- **API**: Next.js API Routes (REST)
- **Background Jobs**: Bull + Redis
- **Database**: PostgreSQL 16
- **Runtime**: Python (Pyodide) para execução de código no navegador

## 📁 Estrutura do Projeto

```
starter-project/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   └── reports/          # Endpoints de reports
│   ├── lesson/               # Página de aula interativa
│   │   ├── page.tsx          # Componente principal
│   │   └── lesson.module.css # Estilos
│   ├── layout.tsx            # Layout raiz
│   ├── page.tsx              # Dashboard
│   └── globals.css           # Estilos globais
│
├── src/                      # Lógica de negócio (compartilhada)
│   ├── db/                   # Database
│   │   ├── schema.sql        # Schema DDL
│   │   ├── migrate.ts        # Migration runner
│   │   └── seed.ts           # Seed data
│   ├── services/             # Business logic
│   │   └── report.service.ts # CRUD de reports
│   ├── workers/              # Background jobs
│   │   ├── queue.ts          # Bull queue config
│   │   └── report.worker.ts  # Worker processor
│   ├── strategies/           # Resolution strategies
│   │   └── index.ts          # Strategy registry
│   ├── types/                # TypeScript types
│   └── utils/                # Utilities (logger, etc)
│
├── public/                   # Static files
│   └── pyodide-worker.js     # Python runtime worker
│
├── docker-compose.yml        # PostgreSQL + Redis
├── next.config.js            # Next.js config
└── tsconfig.json             # TypeScript config
```

## 🚀 Setup

### Pré-requisitos

- Node.js 18+
- Docker & Docker Compose
- npm ou yarn

### Instalação

```bash
# 1. Clone o repositório
git clone <repo-url>
cd starter-project

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env.local

# 4. Inicie serviços (PostgreSQL + Redis)
docker-compose up -d

# 5. Execute migrations
npm run migrate

# 6. (Opcional) Popule dados de exemplo
npm run seed
```

## 🏃 Executar

### Desenvolvimento

```bash
# Inicia Next.js + Worker simultaneamente
npm run dev:all
```

Ou execute separadamente:

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Background worker
npm run dev:worker
```

### Produção

```bash
# Build
npm run build

# Start
npm start
```

### Testes

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

## 📡 API Endpoints

### Reports

#### `POST /api/reports`
Cria novo report de problema.

**Body:**
```json
{
  "student_id": "uuid",
  "lesson_id": "uuid",
  "problem_type": "video" | "exercise" | "canvas" | "other",
  "description": "string",
  "metadata": {
    "current_step": 1,
    "browser": "user-agent",
    "timestamp": "ISO-8601"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report created successfully",
  "data": {
    "id": "uuid",
    "status": "pending",
    "created_at": "ISO-8601"
  }
}
```

#### `GET /api/reports`
Lista reports com filtros opcionais.

**Query Params:**
- `status` (optional): `pending` | `processing` | `auto_resolved` | `failed`
- `problem_type` (optional): `video` | `exercise` | `canvas` | `other`
- `limit` (optional): number (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "problem_type": "exercise",
      "status": "auto_resolved",
      "description": "Código não executa",
      "created_at": "ISO-8601"
    }
  ]
}
```

#### `GET /api/reports/:id`
Busca report específico.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "student_id": "uuid",
    "lesson_id": "uuid",
    "problem_type": "exercise",
    "description": "...",
    "status": "auto_resolved",
    "resolution": {
      "success": true,
      "steps": ["..."]
    },
    "created_at": "ISO-8601",
    "resolved_at": "ISO-8601"
  }
}
```

#### `GET /api/reports/stats`
Estatísticas agregadas.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "pending": 10,
    "processing": 5,
    "auto_resolved": 120,
    "failed": 15,
    "success_rate": 80.0
  }
}
```

## 🎓 Página de Aula

Acesse: `http://localhost:3000/lesson`

### Funcionalidades

**Step 1 - Introdução:**
- Vídeo sincronizado com canvas animado
- Elementos aparecem conforme vídeo avança (0s, 3s, 7s, 11s)

**Step 2 - Quiz:**
- 2 perguntas de múltipla escolha
- Validação de resposta (correto/incorreto)
- Feedback visual

**Step 3 - Compilador Python:**
- Editor de código com syntax highlighting
- Execução via Pyodide (Python no navegador)
- Validação automática de output
- Exercício: exibir "Olá mundo"
- Atalho: `Ctrl + Enter` para executar

**Modal de Report:**
- Formulário para reportar problemas
- Envia para API `/api/reports`
- Worker processa em background

## 🔧 Background Worker

O worker processa reports automaticamente:

1. Busca report no banco
2. Atualiza status para `processing`
3. Encontra strategy apropriada (baseada em `problem_type`)
4. Executa strategy
5. Atualiza status para `auto_resolved` ou `failed`

### Event Listeners

- `completed`: Log de sucesso
- `failed`: Log de erro + retry (3 tentativas)
- `stalled`: Log de job travado

### Graceful Shutdown

Worker responde a `SIGTERM`:
```bash
# Para worker gracefully
kill -SIGTERM <worker-pid>
```

## 🗄️ Database Schema

### Table: `reports`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `student_id` | UUID | Aluno que reportou |
| `lesson_id` | UUID | Aula com problema |
| `problem_type` | ENUM | Tipo: video/exercise/canvas/other |
| `description` | TEXT | Descrição do problema |
| `status` | ENUM | pending/processing/auto_resolved/failed |
| `resolution` | JSONB | Resultado da resolução |
| `metadata` | JSONB | Dados extras (step, browser, etc) |
| `created_at` | TIMESTAMP | Data de criação |
| `resolved_at` | TIMESTAMP | Data de resolução |

### Indexes

- `idx_reports_status` on `status`
- `idx_reports_problem_type` on `problem_type`
- `idx_reports_created_at` on `created_at`

## 🧪 Testando

### Fluxo Completo

1. **Acesse a aula**: http://localhost:3000/lesson
2. **Assista o vídeo**: Canvas anima conforme vídeo avança
3. **Faça o quiz** (Step 2): Valide respostas
4. **Execute código Python** (Step 3):
   ```python
   print("Olá mundo")
   ```
5. **Reporte um problema**: Clique em "⚠️ Relatar um problema"
6. **Verifique processamento**:
   ```bash
   # Logs do worker
   npm run dev:worker

   # Query no banco
   docker exec -it auto-quality-db psql -U postgres -d auto_quality -c "SELECT * FROM reports ORDER BY created_at DESC LIMIT 5;"
   ```

### Testes de API

```bash
# Criar report
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "550e8400-e29b-41d4-a716-446655440099",
    "lesson_id": "550e8400-e29b-41d4-a716-446655440001",
    "problem_type": "exercise",
    "description": "O código não executa",
    "metadata": {}
  }'

# Listar reports
curl http://localhost:3000/api/reports

# Stats
curl http://localhost:3000/api/reports/stats
```

## 🐛 Troubleshooting

### Porta 3000 em uso

Next.js automaticamente usa porta 3001 se 3000 estiver ocupada.

### Worker não processa jobs

1. Verifique Redis:
   ```bash
   docker-compose ps
   docker logs auto-quality-redis
   ```

2. Verifique conexão:
   ```bash
   redis-cli -h localhost -p 6380 ping
   # Deve retornar: PONG
   ```

3. Verifique variável de ambiente:
   ```bash
   cat .env.local | grep REDIS_URL
   # Deve ser: redis://localhost:6380
   ```

### Database connection failed

1. Verifique PostgreSQL:
   ```bash
   docker-compose ps
   docker logs auto-quality-db
   ```

2. Teste conexão:
   ```bash
   docker exec -it auto-quality-db psql -U postgres -d auto_quality -c "SELECT 1;"
   ```

3. Re-execute migrations:
   ```bash
   npm run migrate
   ```

### Pyodide não carrega

1. Verifique arquivo existe:
   ```bash
   ls -la public/pyodide-worker.js
   ```

2. Verifique headers CORS no navegador (DevTools > Network)
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`

3. Limpe cache Next.js:
   ```bash
   rm -rf .next
   npm run dev
   ```

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Next.js dev server |
| `npm run dev:worker` | Background worker (hot reload) |
| `npm run dev:all` | Next.js + Worker simultaneamente |
| `npm run build` | Build de produção |
| `npm start` | Start produção |
| `npm run migrate` | Executa migrations |
| `npm run seed` | Popula dados de exemplo |
| `npm test` | Executa testes |
| `npm run lint` | ESLint check |

## 🔐 Variáveis de Ambiente

Copie `.env.example` para `.env.local` e ajuste:

```bash
# Server
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/auto_quality

# Redis
REDIS_URL=redis://localhost:6380
```

## 📚 Stack Tecnológica

- **Next.js 16** - Framework React com App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **PostgreSQL 16** - Database relacional
- **Redis 7** - Queue storage
- **Bull** - Background jobs
- **Pyodide** - Python runtime (WebAssembly)
- **Winston** - Logging
- **Zod** - Schema validation
- **Jest** - Testing framework

## 🤝 Contribuindo

1. Fork o repositório
2. Crie branch de feature (`git checkout -b feature/nova-strategy`)
3. Commit mudanças (`git commit -m 'Add nova strategy'`)
4. Push para branch (`git push origin feature/nova-strategy`)
5. Abra Pull Request

## 📄 Licença

MIT
