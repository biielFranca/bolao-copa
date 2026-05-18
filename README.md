<div align="center">

# ⚽ Bolão da Copa — Lau Burguer 🇧🇷

**Sistema de bolão da Copa do Mundo para lanchonete**

Clientes escaneiam um QR Code, fazem login pelo celular e enviam seus palpites. Simples, rápido e sem senha.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

</div>

---

## Sobre o projeto

O **Bolão da Copa da Lau Burguer** é um MVP de bolão online criado para ser usado diretamente no celular. Os clientes escaneiam um QR Code, registram o número de telefone e fazem seus palpites da Copa do Mundo.

**Fluxo do usuário em 3 passos:**

```
📱 Escaneia o QR Code → 📞 Entra com o celular → ⚽ Envia os palpites
```

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Cookie JWT assinado (sem senha) |
| Hospedagem | Vercel |

---

## Começando

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/bolao-copa.git
cd bolao-copa
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite o `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
ADMIN_SECRET=senha-do-admin
```

### 4. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute os arquivos abaixo na ordem:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls.sql
```

3. Copie a URL e as chaves em **Settings > API**

### 5. Inicie o servidor

```bash
npm run dev
```

Acesse em [http://localhost:3000](http://localhost:3000)

---

## Páginas

| Rota | Descrição | Acesso |
|---|---|---|
| `/` | Login por telefone | Público |
| `/palpites` | Formulário de palpites | Requer login |
| `/ranking` | Ranking em tempo real | Público |
| `/admin` | Painel administrativo | Requer senha |

---

## Painel Admin

Acesse `/admin` e insira a senha definida em `ADMIN_SECRET`.

**O que o admin pode fazer:**

- Ver lista de participantes e palpites enviados
- Inserir resultados das partidas (Brasil × Marrocos, Haiti e Escócia)
- Inserir campeão do mundo, ordem do grupo e total de gols do Brasil
- Bloquear ou desbloquear o envio de novos palpites
- Exportar o ranking completo em CSV

---

## Regras de Pontuação

### Placar das partidas

| Resultado | Pontos |
|---|---|
| Placar exato | **5 pontos** |
| Vencedor ou empate correto | **2 pontos** |
| Errou o resultado | 0 pontos |

### Bônus de torneio

| Acerto | Pontos |
|---|---|
| Campeão do mundo | **10 pontos** |
| Posição exata do Brasil no grupo | **5 pontos** |
| Cada posição correta no grupo | **2 pontos** |

### Pontuação máxima possível

> 3 placares exatos (15) + campeão (10) + posição Brasil (5) + 3 posições de grupo (6) = **36 pontos**

---

## Critérios de Desempate

Em caso de empate na pontuação, a classificação segue esta ordem:

| Prioridade | Critério |
|---|---|
| 1 | Maior pontuação total |
| 2 | Acertou o campeão do mundo |
| 3 | Mais placares exatos |
| 4 | Acertou a posição do Brasil no grupo |
| 5 | Palpite mais próximo do total de gols do Brasil |
| 6 | Quem enviou os palpites primeiro |

---

## Deploy no Vercel

1. Faça push para um repositório GitHub
2. Importe em [vercel.com/new](https://vercel.com/new)
3. Adicione as variáveis de ambiente no painel do Vercel
4. Deploy automático a cada push na `main`

---

## Estrutura do projeto

```
bolao-copa/
├── app/
│   ├── page.tsx              # / — Login por telefone
│   ├── palpites/page.tsx     # /palpites — Formulário
│   ├── ranking/page.tsx      # /ranking — Ranking público
│   ├── admin/page.tsx        # /admin — Painel admin
│   └── api/                  # API Routes
│       ├── auth/login/       # POST — login por telefone
│       ├── palpites/submit/  # POST — envio de palpites
│       └── admin/            # Resultados, lock, export
├── lib/
│   ├── scoring.ts            # Engine de pontuação (função pura)
│   ├── session.ts            # Cookies JWT assinados
│   ├── phone.ts              # Normalização de telefone
│   └── supabase/             # Clientes browser e server
├── supabase/
│   └── migrations/           # Schema SQL + RLS
└── proxy.ts                  # Proteção de rotas (Next.js 16)
```

---

## Limitações do MVP

> Este projeto é um MVP intencional. As seguintes funcionalidades foram deixadas de fora por design:

- **Login sem SMS**: o login é feito apenas pelo número de celular, sem verificação por código. Qualquer pessoa que conheça o número de outra pode acessar como ela. Não armazene dados sensíveis.
- Sem bracket completo de mata-mata
- Sem integração automática com APIs de resultados esportivos
- Sem sistema de pagamento
- Sem autenticação robusta para participantes

---

## Design visual

O design visual (cores, tipografia, identidade Brasil/Copa) é direcionado pelo **Claude Design** e será integrado separadamente. A estrutura atual usa Tailwind CSS como base funcional.
