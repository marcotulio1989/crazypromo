# Guia de Implantação na Nuvem / Cloud Deployment Guide

## 🌐 Português

### Configuração para Vercel

Este projeto está otimizado para implantação no Vercel com as seguintes melhorias:

#### ✅ Melhorias Implementadas

1. **Validação de Variáveis de Ambiente**
   - `DATABASE_URL` é obrigatório em produção
   - Sem fallback para localhost em produção
   - Falha explícita se variáveis necessárias estiverem ausentes

2. **Pool de Conexões Otimizado**
   - Configurado para ambientes serverless
   - Máximo de 10 conexões simultâneas
   - Timeout de conexões ociosas (30s)
   - Timeout de conexão (10s)

3. **Tarefas Agendadas (Cron Jobs)**
   - Endpoint `/api/cron/update-prices` para atualização de preços
   - Configurado para rodar a cada 6 horas
   - Proteção com `CRON_SECRET` em produção

4. **Configuração de Funções Serverless**
   - APIs padrão: 30s timeout, 1024MB memória
   - Cron jobs: 60s timeout, 1024MB memória

#### 📝 Passo a Passo

##### 1. Banco de Dados
Escolha um provedor de PostgreSQL compatível com Vercel:
- **Vercel Postgres** (recomendado)
- **Supabase**
- **Neon**
- **Railway**

Obtenha a connection string no formato:
```
postgresql://user:password@host:5432/database?sslmode=require
```

##### 2. Configurar Variáveis de Ambiente no Vercel

Vá em Settings → Environment Variables e adicione:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | Connection string do PostgreSQL | `postgresql://...` |
| `AUTH_SECRET` | Chave secreta NextAuth | Gere com `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL do seu site | `https://seu-app.vercel.app` |
| `ADMIN_EMAIL` | Email do admin (para seed) | `admin@exemplo.com` |
| `ADMIN_PASSWORD` | Senha do admin (para seed) | Senha segura |
| `CRON_SECRET` | Chave para cron jobs | Gere com `openssl rand -base64 32` |
| `NODE_ENV` | Ambiente | `production` |

##### 3. Deploy

```bash
# Via Vercel CLI
npm i -g vercel
vercel

# Via Git
# Conecte seu repositório no painel do Vercel
```

##### 4. Executar Migrations e Seed

```bash
# Execute após o primeiro deploy
npx vercel env pull .env.local
npx prisma migrate deploy
npx prisma db seed
```

#### 🔧 Cron Jobs

Os cron jobs são configurados automaticamente via `vercel.json`. Para testar manualmente:

```bash
curl -X GET https://seu-app.vercel.app/api/cron/update-prices \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

#### ⚠️ Importante

- Nunca commit arquivos `.env` com secrets reais
- Use senhas fortes para `ADMIN_PASSWORD`
- Mantenha `CRON_SECRET` e `AUTH_SECRET` seguros
- Configure `sslmode=require` na `DATABASE_URL` em produção

---

## 🌐 English

### Vercel Deployment Setup

This project is optimized for Vercel deployment with the following improvements:

#### ✅ Implemented Improvements

1. **Environment Variable Validation**
   - `DATABASE_URL` is required in production
   - No localhost fallback in production
   - Explicit failure if required variables are missing

2. **Optimized Connection Pool**
   - Configured for serverless environments
   - Maximum 10 concurrent connections
   - Idle connection timeout (30s)
   - Connection timeout (10s)

3. **Scheduled Tasks (Cron Jobs)**
   - `/api/cron/update-prices` endpoint for price updates
   - Configured to run every 6 hours
   - Protected with `CRON_SECRET` in production

4. **Serverless Function Configuration**
   - Standard APIs: 30s timeout, 1024MB memory
   - Cron jobs: 60s timeout, 1024MB memory

#### 📝 Step by Step

##### 1. Database
Choose a Vercel-compatible PostgreSQL provider:
- **Vercel Postgres** (recommended)
- **Supabase**
- **Neon**
- **Railway**

Get the connection string in the format:
```
postgresql://user:password@host:5432/database?sslmode=require
```

##### 2. Configure Environment Variables in Vercel

Go to Settings → Environment Variables and add:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `AUTH_SECRET` | NextAuth secret key | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your site URL | `https://your-app.vercel.app` |
| `ADMIN_EMAIL` | Admin email (for seeding) | `admin@example.com` |
| `ADMIN_PASSWORD` | Admin password (for seeding) | Secure password |
| `CRON_SECRET` | Secret for cron jobs | Generate with `openssl rand -base64 32` |
| `NODE_ENV` | Environment | `production` |

##### 3. Deploy

```bash
# Via Vercel CLI
npm i -g vercel
vercel

# Via Git
# Connect your repository in the Vercel dashboard
```

##### 4. Run Migrations and Seed

```bash
# Execute after first deployment
npx vercel env pull .env.local
npx prisma migrate deploy
npx prisma db seed
```

#### 🔧 Cron Jobs

Cron jobs are automatically configured via `vercel.json`. To test manually:

```bash
curl -X GET https://your-app.vercel.app/api/cron/update-prices \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### ⚠️ Important

- Never commit `.env` files with real secrets
- Use strong passwords for `ADMIN_PASSWORD`
- Keep `CRON_SECRET` and `AUTH_SECRET` secure
- Configure `sslmode=require` in `DATABASE_URL` for production
